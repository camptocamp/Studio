import logging
import tempfile

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

        if datastore.connection_type == 'directory':
            extractall(h.tofile(request.POST['datasources']),
                       request.POST['datasources'].filename,
                       datastore.datastore_str)
        elif datastore.connection_type == 'postgis':
            tmpdir = tempfile.mkdtemp(prefix="sourceupload_")
            extractall(h.tofile(request.POST['datasources']),
                       request.POST['datasources'].filename,
                       tmpdir)
            
            in_datastore = DataStore(tmpdir)
            in_sources = in_datastore.get_vector_datasources()
            for in_ds in in_sources:
                datastore.import_datasource(in_ds)

            # FIXME: remove tmpdir
        else:
            # unknown datastore type
            abort(501)

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
