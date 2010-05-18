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

from repoze.what.predicates import not_anonymous, has_permission
from repoze.what.plugins.pylonshq import ActionProtector
from studio.lib.base import BaseController, render
from studio.lib import helpers as h
from studio.model import *

log = logging.getLogger(__name__)

class LayertemplatesController(BaseController):
    """REST Controller styled on the Atom Publishing Protocol"""
    # To properly map this controller, ensure your config/routing.py file has
    # a resource setup:
    #     map.resource('LayerTemplates', 'layertemplates')

    @ActionProtector(not_anonymous())
    def __before__(self):
        c.user = request.environ.get('repoze.what.credentials')['repoze.what.userid']

    @ActionProtector(has_permission('view_layertemplates'))
    @jsonify
    def index(self, format='html'):
        """GET /layertemplates: All items in the collection."""
        # url('layertemplates')
        lts = meta.Session.query(LayerTemplate)
        # use following query for getting layertemplates owned by current user
        #lts = self._get_lts_from_user(c.user)
        serialized_lts = []
        for lt in lts:
            serialized_lts.append({
                'id': lt.id,
                'name': lt.name,
                'comment': lt.comment,
                "href": h.url_for(controller="layertemplates", action="show", id=lt.id)
                })
        # prevent JSON Array Cross-site Exploits (XSRF/CSRF)
        return {'layertemplates': serialized_lts}

    @ActionProtector(has_permission('create_update_layertemplates'))
    @jsonify
    def create(self):
        """POST /layertemplates: Create a new item."""
        # url('layertemplates')
        content = request.environ['wsgi.input'].read(int(request.environ['CONTENT_LENGTH']))
        content = content.decode('utf8')
        content = simplejson.loads(content)
        lt = self._new_lt_from_user(content['name'], content['comment'], content['json'], c.user)
        response.status = 201
        href = h.url_for(controller="layertemplates", action="show", id=lt.id)
        return {'name': lt.name, 'comment': lt.comment, 'id': lt.id, 'href': href}


    @ActionProtector(has_permission('create_update_layertemplates'))
    def update(self, id):
        """PUT /layertemplates/id: Update an existing item."""
        # url('LayerTemplates', id=ID)
        lt = meta.Session.query(LayerTemplate).get(id)
        # use following query for getting a layertemplate owned by current user
        #lt = self._get_lt_from_user_by_id(c.user, id)
        if lt is None:
            abort(404)
        content = request.environ['wsgi.input'].read(int(request.environ['CONTENT_LENGTH']))
        content = content.decode('utf8')
        content = simplejson.loads(content)        
        lt.name = content['name']
        lt.comment = content['comment']
        lt.json = content['json']
        meta.Session.commit()
        response.status = 201

    @ActionProtector(has_permission('create_update_layertemplates'))
    def delete(self, id):
        """DELETE /layertemplates/id: Delete an existing item."""
        # url('LayerTemplates', id=ID)
        lt = meta.Session.query(LayerTemplate).get(id)
        # use following query for getting a layertemplate owned by current user
        #lt = self._get_lt_from_user_by_id(c.user, id)
        if lt is None:
            abort(404)
        meta.Session.delete(lt)
        meta.Session.commit()

    @ActionProtector(has_permission('view_layertemplates'))
    @jsonify
    def show(self, id):
        """GET /layertemplates/id: Show a specific item."""
        # url('LayerTemplates', id=ID)
        lt = meta.Session.query(LayerTemplate).get(id)
        # use following query for getting a layertemplate owned by current user
        #lt = self._get_lt_from_user_by_id(c.user, id)
        if lt is None:
            abort(404)
        return lt.to_json()


    def _get_lts_from_user(self, user):
        """ Get layertemplates owned by a user from the database. """
        req = meta.Session.query(LayerTemplate).select_from(join(LayerTemplate, User))
        return req.filter(User.login==user).all()

    def _get_lt_from_user_by_id(self, user, lt_id):
        """ Get a layertemplate owned by a user from the database by lt_id. """
        req = meta.Session.query(LayerTemplate).select_from(join(LayerTemplate, User))
        try:
            return req.filter(and_(User.login==user, LayerTemplate.id==lt_id)).one()
        except Exception, e:
            return None

    def _new_lt_from_user(self, name, comment, json, user):
        lt = LayerTemplate(name, comment, json)
        lt.user = meta.Session.query(User).filter(User.login==user).one()
        meta.Session.add(lt)
        meta.Session.commit()
        return lt

