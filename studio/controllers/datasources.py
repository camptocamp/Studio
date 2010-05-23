#
# Copyright (C) 2010  Camptocamp
#
# This file is part of Studio
#
# Studio is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Studio is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Studio.  If not, see <http://www.gnu.org/licenses/>.
#

import logging
import os
import shutil
from tempfile import mkstemp

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify
from pylons import config

from repoze.what.predicates import has_permission
from repoze.what.plugins.pylonshq import ActionProtector
from studio.lib.base import BaseController, render
from studio.lib import helpers as h
from studio.lib.archivefile import extractall
from studio.lib.datasource_discovery import discover_datasources, discover_datasource_columns, get_mapfile, DataStore, DataSource

from studio import model
from studio.model.meta import Session

log = logging.getLogger(__name__)

class DatasourcesController(BaseController):
    """ The datasource controller. """ 
    @ActionProtector(has_permission('view_datasources'))
    def __before__(self):
        pass

    @jsonify
    def index(self, datastore_id=None):
        """ GET /datastores/{datastore_id}/datasources: Get all
            datasources within a given datastore."""
        datastore = self._get_datastore_by_id(datastore_id)
        if datastore is None:
            abort(404)
        discovery_result = discover_datasources(datastore.ogrstring)
        for datasource in discovery_result:
            datasource['href'] = h.url_for(controller="datasources", action="show", datastore_id=datastore_id, datasource_id=datasource['id'])
        # prevent JSON Array Cross-site Exploits (XSRF/CSRF)
        return {'datasources': discovery_result}

    @ActionProtector(has_permission('create_datasources'))
    def create(self, datastore_id=None):
        """POST /datastores/{datastore_id}/datasources: Create a new
        datasource by file upload."""

        datastore = self._get_ogrdatastore_by_id(datastore_id)
        if not datastore:
            abort(404)

        # only "directory" datastores are supported at this point
        if datastore.connection_type != 'directory':
            abort(400)

        # use mkstemp to store the file to avoid issues with
        # NamedTemporaryFile that can't be open a second time
        # on Windows. See:
        # http://docs.python.org/library/tempfile.html#tempfile.NamedTemporaryFile
        # "Whether the name can be used to open the file a second time, while the
        # named temporary file is still open, varies across platforms (it can be so
        # used on Unix; it cannot on Windows NT or later).
        fd, fn = mkstemp()
        tmpfile = os.fdopen(fd, 'wb')
        fieldstorage = request.POST['datasources']
        shutil.copyfileobj(fieldstorage.file, tmpfile)
        fieldstorage.file.close()
        tmpfile.close()

        extractall(fn,
                   request.POST['datasources'].filename,
                   datastore.datastore_str)

        # we are reponsible for removing the temporary file
        os.remove(fn)

        response.status = 201
        
    @jsonify
    def showcolumns(self, datastore_id=None, datasource_id=None):
        """ GET /datastores/{datastore_id}/datasources/{datasource_id}/columns: Get a
            specific datasource's columns within a given datastore. """
        datastore = self._get_datastore_by_id(datastore_id)
        if datastore is None:
            abort(404)
        discovery_result = discover_datasource_columns(datastore.ogrstring, datasource_id)
        if discovery_result is None:
            abort(404)
        # prevent JSON Array Cross-site Exploits (XSRF/CSRF)
        return {"columns": discovery_result}

    @jsonify
    def showmapfile(self,datastore_id=None, datasource_id=None):
        """ GET /datastores/{datastore_id}/datasources/{datasource_id}/mapfile: Get
            the JSON representation of a specific datasource's default MapFile LAYER
            block. """
        datastore = self._get_datastore_by_id(datastore_id)
        if datastore is None:
            abort(404)
        classification = None
        if 'classification' in request.params and 'attribute' in request.params:
            classification = {}
            classification['type'] = request.params['classification']
            classification['attribute'] = request.params['attribute']
            if classification['type'] == "quantile":
                classification['intervals'] = request.params['intervals']
            
            palette = {}
            palette['type']='ramp'
            if 'colortype' in request.params:
                palette['type'] = request.params['colortype']
            if 'startcolor' in request.params:
                c = request.params['startcolor']
                if c.startswith('#'):
                    c = c[1:]
                palette['startcolor'] = [int(c[0:2],16),int(c[2:4],16),int(c[4:6],16)]
            if 'endcolor' in request.params:
                c = request.params['endcolor']
                if c.startswith('#'):
                    c = c[1:]
                palette['endcolor'] = [int(c[0:2],16),int(c[2:4],16),int(c[4:6],16)]
            if 'interpolation' in request.params:
                palette['interpolation'] = request.params['interpolation']
            if 'theme' in request.params:
                palette['theme'] = int(request.params['theme'])
            classification['palette'] = palette

        mapfile = get_mapfile(datastore.ogrstring, datasource_id, classification)
        if 'metadata' not in mapfile:
            mapfile['metadata']={}
        mapfile['metadata']['datastoreid']=datastore_id
        mapfile['metadata']['datasourceid']=datasource_id
        if mapfile is None:
            abort(404)
        return mapfile

    @jsonify
    def show(self,datastore_id=None, datasource_id=None):
        datastore = self._get_datastore_by_id(datastore_id)
        if datastore is None:
            abort(404)
        return {"response":"what should be returned here?"}


    def _get_datastore_by_id(self, datastore_id):
        """ Get from the database the datastore identifier by
            datastore_id. """
        return Session.query(model.DataStore).get(datastore_id)

    def _get_ogrdatastore_by_id(self, datastore_id):
        datastore = self._get_datastore_by_id(datastore_id)
        if datastore:
            return DataStore(datastore.ogrstring)
