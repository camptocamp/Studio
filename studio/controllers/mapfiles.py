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
import os
from paste.fileapp import FileApp

from pylons import request, response, session, config, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from studio.lib.base import BaseController
from studio.lib.mapserializer import Mapfile, create_default_mapfile
from studio.lib import helpers as h
from studio.model import Map, User
from studio.model.meta import Session

from repoze.what.plugins.pylonshq import ActionProtector
from repoze.what.predicates import not_anonymous, has_permission
from sqlalchemy.orm import join
from sqlalchemy import and_

import urlparse
import urllib2
from urllib import urlencode

log = logging.getLogger(__name__)


class MapfilesController(BaseController):
    """ The mapfile controller """

    @ActionProtector(not_anonymous())
    def __before__(self):
        c.user = request.environ.get('repoze.what.credentials')['repoze.what.userid']

    @ActionProtector(has_permission('view_mapfiles'))
    @jsonify
    def index(self):
        """ GET /mapfiles: Get all mapfiles owned by the current user """
        maps = self._get_maps_from_user(c.user)
        serialized_maps = []
        for m in maps:
            serialized_maps.append({
                "id": m.id,
                "name": m.name,
                "href": h.url_for(controller="mapfiles", action="show", id=m.id),
                'wmsproxyurl':h.url_for(controller='mapfiles', action='wms_proxy', id=m.id),
                'wmsurl': "%s?%s" %(config['mapserver_url'], urlencode({'map':os.path.join(config['mapfiles_dir'], m.filepath)}))
            })
        # prevent JSON Array Cross-site Exploits (XSRF/CSRF)
        return {'maps': serialized_maps}

    @ActionProtector(has_permission('create_update_mapfiles'))
    @jsonify
    def create(self):
        """POST /mapfiles: Create a new item."""
        # get json content from POST request
        content = request.environ['wsgi.input'].read(int(request.environ['CONTENT_LENGTH']))
        #content = content.decode('utf8')   mapfile interface don't like unicode strings... bad...

        # load mapfile
        mapfile = Mapfile()
        dict = simplejson.loads(content)
        mapfile.from_dict(dict)

        # create mapfile
        mapname = mapfile.get_name()
        map_pathname = h.gen_mapname()
        mapfile.to_file(os.path.join(config['mapfiles_dir'], map_pathname))

        # create map in db
        map = self._new_map_from_user(c.user, mapname, map_pathname)

        response.status = 201

        href = h.url_for(controller="mapfiles", action="show", id=map.id)
        wmsproxyurl = h.url_for(controller='mapfiles', action='wms_proxy', id=map.id)
        wmsurl = "%s?%s" %(config['mapserver_url'], urlencode({'map':os.path.join(config['mapfiles_dir'], map.filepath)}))
        return {'name': map.name, 'id': map.id, 'href': href, 'wmsurl': wmsurl, 'wmsproxyurl': wmsproxyurl}

    @ActionProtector(has_permission('create_update_mapfiles'))
    def update(self, id):
        """PUT /mapfiles/id: Update an existing item."""
        map = self._get_map_from_user_by_id(c.user, id)
        if map is None:
            abort(404)

        # get json content from PUT request
        content = request.environ['wsgi.input'].read(int(request.environ['CONTENT_LENGTH']))
        #content = content.decode('utf8')

        # update mapfile
        mapfile = Mapfile()
        dict = simplejson.loads(content)
        mapfile.from_dict(dict)
        mapfile.to_file(os.path.join(config['mapfiles_dir'], map.filepath))
        if mapfile.get_name() != map.name:
            self._update_map(map, name=mapfile.get_name())

        response.status = 201
        return

    @ActionProtector(has_permission('create_update_mapfiles'))
    def delete(self, id):
        """DELETE /mapfiles/id: Delete an existing mapfile owned by the current
        user. Deletion of the map entry in db and remove mapfile from filesystem. """
        map = self._delete_map_from_user_by_id(c.user, id)
        if map is None:
            abort(404)
        if os.path.exists(os.path.join(config['mapfiles_dir'], map.filepath)):
            os.unlink(os.path.join(config['mapfiles_dir'], map.filepath))

        response.status = 204
        # remove content-type from response headers so that webtest won't get confused
        # http://groups.google.com/group/pylons-discuss/browse_thread/thread/1267650386ae521b
        del response.headers['content-type'] 
        return

    @ActionProtector(has_permission('view_mapfiles'))
    @jsonify
    def show(self, id):
        """ GET /mapfiles/id: Get a specific mapfile owned by the current user. """
        map = self._get_map_from_user_by_id(c.user, id)
        if map is None:
            abort(404)
        mapfile = Mapfile()
        mapfile.from_file(os.path.join(config['mapfiles_dir'], map.filepath))
        return {
            'map': mapfile.to_dict(),
            'wmsproxyurl': h.url_for(controller='mapfiles', action='wms_proxy', id=id),
            'wmsurl': "%s?%s" %(config['mapserver_url'], urlencode({'map':os.path.join(config['mapfiles_dir'], map.filepath)}))
        }

    @ActionProtector(has_permission('view_mapfiles'))
    @jsonify
    def get_fonts(self, id):
        map = self._get_map_from_user_by_id(c.user, id)
        if map is None:
            abort(404)
        mapfile = Mapfile()
        mapfile.from_file(os.path.join(config['mapfiles_dir'], map.filepath))
        # prevent JSON Array Cross-site Exploits (XSRF/CSRF)
        return {'fonts': mapfile.get_fonts()}

    @ActionProtector(has_permission('view_mapfiles'))
    @jsonify
    def get_symbols(self,id):
        map = self._get_map_from_user_by_id(c.user, id)
        if map is None:
            abort(404)
        mapfile = Mapfile()
        mapfile.from_file(os.path.join(config['mapfiles_dir'], map.filepath))
        # prevent JSON Array Cross-site Exploits (XSRF/CSRF)
        return {'symbols': mapfile.get_symbols()}
    
    @ActionProtector(has_permission('view_mapfiles'))
    @jsonify
    def get_default_mapfile(self):
        mapfile = create_default_mapfile()
        return {'map':mapfile.to_dict()}

    @ActionProtector(has_permission('view_mapfiles'))
    def download_mapfile(self, id):
        map = self._get_map_from_user_by_id(c.user, id)
        if map is None:
            abort(404)
        filename = os.path.join(config['mapfiles_dir'], map.filepath)
        fapp = FileApp(filename, **{"content_type":"text/plain",
            "Content-Disposition":"attachment; filename="+filename})
        return fapp(request.environ, self.start_response)
    
    @ActionProtector(has_permission('view_mapfiles'))
    def wms_proxy(self, id):
        map = self._get_map_from_user_by_id(c.user, id)
        if map is None:
            abort(404)
        return self._proxy(config['mapserver_url'],{'map':os.path.join(config['mapfiles_dir'], map.filepath)}) 
        
    def _get_map_from_user_by_id(self, user, map_id):
        """ Get a mapfile owned by a user from the database by
            map_id. """
        req = Session.query(Map).select_from(join(Map, User))
        try:
            return req.filter(and_(User.login==user, Map.id==map_id)).one()
        except Exception, e:
            return None

    def _get_maps_from_user(self, user):
        """ Get mapfiles owned by a user from the database. """
        req = Session.query(Map).select_from(join(Map, User))
        return req.filter(User.login==user).all()

    def _delete_map_from_user_by_id(self, user, map_id):
        """ Delete a mapfile entry from database. """
        map = self._get_map_from_user_by_id(user, map_id)
        if map is None:
            return None
        Session.delete(map)
        Session.commit()
        return map

    def _update_map(self, map, name=None, filepath=None):
        """ Delete a mapfile entry from database. """
        if name:
            map.name = name
        if filepath:
            map.filepath = filepath
        Session.commit()

    def _new_map_from_user(self, user, name, filepath):
        """ Create a new mapfile entry in database. """
        map = Map(name, filepath)
        map.user = Session.query(User).filter(User.login==user).one()
        Session.add(map)
        Session.commit()
        return map

    def _proxy(self, url, urlparams=None):
        """Do the actual action of proxying the call.
        """
        for k,v in request.params.iteritems():
            urlparams[k]=v
        query = urlencode(urlparams)
        full_url = url
        if query:
            if not full_url.endswith("?"):
                full_url += "?"
            full_url += query

        # build the request with its headers
        req = urllib2.Request(url=full_url)
        for header in request.headers:
            if header.lower() == "host":
                req.add_header(header, urlparse.urlparse(url)[1])
            else:
                req.add_header(header, request.headers[header])
        res = urllib2.urlopen(req)

        # add response headers
        i = res.info()
        response.status = res.code
        got_content_length = False
        for header in i:
            # We don't support serving the result as chunked
            if header.lower() == "transfer-encoding":
                continue
            if header.lower() == "content-length":
                got_content_length = True
            response.headers[header] = i[header]

        # return the result
        result = res.read()
        res.close()

        #if not got_content_length:
        #    response.headers['content-length'] = str(len(result))
        return result

