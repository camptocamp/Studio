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
import simplejson

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from repoze.what.predicates import has_permission
from repoze.what.plugins.pylonshq import ActionProtector
from studio.lib.base import BaseController
from studio.lib import helpers as h
from studio.model import *
from studio.lib.datasource_discovery import discover_datasources

log = logging.getLogger(__name__)

class DatastoresController(BaseController):
    """REST Controller styled on the Atom Publishing Protocol"""
    # To properly map this controller, ensure your config/routing.py file has
    # a resource setup:
    #     map.resource('DataStores', 'datastores')

    @ActionProtector(has_permission('view_datastores'))
    @jsonify
    def index(self, format='html'):
        """GET /datastores: All items in the collection."""
        # url('datastores')
        results = meta.Session.query(DataStore)
        serialized_datastores = [{'id': ds.id, 'text': ds.name, 'href': h.url_for(controller="datastores", action="show", id=ds.id), 'type': ds.type} for ds in results]
        # prevent JSON Array Cross-site Exploits (XSRF/CSRF)
        return {'datastores': serialized_datastores}

    @ActionProtector(has_permission('create_update_datastores'))
    def create(self):
        """POST /datastores: Create a new item."""
        # url('datastores')
        content = request.environ['wsgi.input'].read(int(request.environ['CONTENT_LENGTH']))
        content = content.decode('utf8')
        content = simplejson.loads(content)
        new = DataStore(content['name'],
                        content['type'],
                        content['ogrstring'])
        results = meta.Session.add(new)
        meta.Session.commit()
        response.status = 201

    @ActionProtector(has_permission('create_update_datastores'))
    def update(self, id):
        """PUT /datastores/id: Update an existing item."""
        # url('DataStores', id=ID)
        content = request.environ['wsgi.input'].read(int(request.environ['CONTENT_LENGTH']))
        content = content.decode('utf8')
        content = simplejson.loads(content)        
        result = meta.Session.query(DataStore).get(id)
        result.name = content['name']
        result.type = content['type']
        result.ogrstring = content['ogrstring']
        meta.Session.commit()
        response.status = 201

    @ActionProtector(has_permission('create_update_datastores'))
    def delete(self, id):
        """DELETE /datastores/id: Delete an existing item."""
        # url('DataStores', id=ID)
        result = meta.Session.query(DataStore).get(id)
        meta.Session.delete(result)
        meta.Session.commit()

        response.status = 204
        # remove content-type from response headers so that webtest won't get confused
        # http://groups.google.com/group/pylons-discuss/browse_thread/thread/1267650386ae521b
        del response.headers['content-type']
        
    @ActionProtector(has_permission('view_datastores'))
    @jsonify
    def show(self, id):
        """GET /datastores/id: Show a specific item."""
        # url('DataStores', id=ID)
        datastore = meta.Session.query(DataStore).get(id)

        # do not raise RuntimeError from discover_datasources
        # if in "test" mode
        try:
            datasources = discover_datasources(datastore.ogrstring)
        except RuntimeError:
            if "test" in request.params:
                datasources = None
            else:
                raise

        result = datastore.to_json()
        result['datasources'] = datasources
        return result
