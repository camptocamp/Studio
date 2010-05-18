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

from pylons import config
from studio import model
from studio.lib.mapserializer import Mapfile
from urlparse import urlparse
from shutil import copy
import os
import simplejson

from studio.tests import *
from studio.tests.lib.helpers import log_in, log_out
from studio.lib.provisionning import create_mapfile, delete_mapfile, change_mapfile_paths
import studio.lib.helpers as h


class TestMapfilesController(TestController):

    def test_index(self):
        """ GET /mapfiles: Get all mapfiles owned by the current user """
        # Create new mapfile for this test
        filename = h.gen_mapname()
        map = create_mapfile('Dummy mapfile name', filename)
        # login as admin to be allowed to access /mapfiles
        log_in(self.app, 'enduser', 'password')

        response = self.app.get(url('mapfiles'))
        assert response.response.content_type == 'application/json'
        assert '"maps": [' in response
        assert 'Dummy mapfile name' in response

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.get(url('mapfiles'), status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

        # Clean the test mapfile
        delete_mapfile(map)


    def test_show(self):
        """ GET /mapfiles/id: Get a specific mapfile owned by the current user. """
        # Create new mapfile for this test
        filename = h.gen_mapname()
        map = create_mapfile('Dummy mapfile name', filename)
        # login as admin to be allowed to access /mapfiles/1
        log_in(self.app, 'enduser', 'password')

        response = self.app.get(url('MapFiles', id=map.id))
        assert response.response.content_type == 'application/json'
        assert '"map": {' in response
        assert 'Dummy mapfile name' in response

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.get(url('MapFiles', id=map.id), status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

        # Clean the test mapfile
        delete_mapfile(map)


    def test_get_symbols(self):
        # Create new mapfile for this test
        filename = h.gen_mapname()
        map = create_mapfile('Dummy mapfile name', filename)
        # login as admin to be allowed to access /mapfiles/1
        log_in(self.app, 'enduser', 'password')

        response = self.app.get(url(controller='mapfiles', action='get_symbols', id=map.id))
        assert response.response.content_type == 'application/json'
        assert '"symbols": [' in response

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.get(url(controller='mapfiles', action='get_symbols', id=map.id),
                status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

        # Clean the test mapfile
        delete_mapfile(map)


    def test_get_fonts(self):
        # Create new mapfile for this test
        filename = h.gen_mapname()
        map = create_mapfile('Dummy mapfile name', filename)
        # login as admin to be allowed to access /mapfiles/1
        log_in(self.app, 'enduser', 'password')

        response = self.app.get(url(controller='mapfiles', action='get_fonts', id=map.id))
        assert response.response.content_type == 'application/json'
        assert '"fonts": [' in response

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.get(url(controller='mapfiles', action='get_fonts', id=map.id),
                status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

        # Clean the test mapfile
        delete_mapfile(map)


    def test_get_default_mapfile(self):
        """ GET /mapfiles/default: Get a default mapfile. """
        # login as admin to be allowed to access /mapfiles/1
        log_in(self.app, 'enduser', 'password')

        response = self.app.get(url(controller='mapfiles', action='get_default_mapfile'))
        assert response.response.content_type == 'application/json'
        assert '"map": {' in response

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.get(url(controller='mapfiles', action='get_default_mapfile'), status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"


    def test_create(self):
        """POST /mapfiles: Create a new item."""
        # login as admin to be allowed to access /mapfiles/1
        log_in(self.app, 'enduser', 'password')

        mapfile = Mapfile()
        mapfile.from_file(os.path.join(config['mapserver_dir'], 'dummy_mapfile.map'))
        mapfile.set_name('Dummy mapfile name')
        mapfile = change_mapfile_paths(mapfile)
        dict = mapfile.to_dict()
        content = simplejson.dumps(dict)

        # post create request that must be tested
        response = self.app.post(url('mapfiles'), params=content, content_type='application/json')
        dict = simplejson.loads(response.normal_body)

        print os.path.join(config['mapfiles_dir'], dict['name'])
        map = model.meta.Session.query(model.Map).filter(model.Map.name=='Dummy mapfile name').one()
        assert map.id == dict['id']
        assert map.name == dict['name']
        assert os.path.exists(os.path.join(config['mapfiles_dir'], map.filepath))

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.post(url('mapfiles'), params=content, content_type='application/json',
                status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

        # Clean the mapfile created by POST request
        delete_mapfile(map)


    def test_update(self):
        """PUT /mapfiles/id: Update an existing item."""
        # Create new mapfile for this test
        filename = h.gen_mapname()
        map = create_mapfile('Dummy mapfile name', filename)
        # login as admin to be allowed to access /mapfiles/1
        log_in(self.app, 'enduser', 'password')

        mapfile = Mapfile()
        mapfile.from_file(os.path.join(config['mapserver_dir'], 'dummy_mapfile.map'))
        mapfile.set_name('New dummy name')
        mapfile = change_mapfile_paths(mapfile)
        dict = mapfile.to_dict()
        content = simplejson.dumps(dict)

        # PUT update request that must be tested
        map_id = map.id
        response = self.app.put(url('MapFiles', id=map_id), params=content,
                content_type='application/json')
        updated_map = model.meta.Session.query(model.Map).get(map_id)
        assert updated_map.name == 'New dummy name'
        map_path = os.path.join(config['mapfiles_dir'],updated_map.filepath)
        assert os.path.exists(map_path)
        mapobj = Mapfile()
        mapobj.from_file(map_path)
        assert mapobj.get_name() == 'New dummy name'

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.get(url('MapFiles', id=map_id), params=content,
                status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

        # Clean the test mapfile
        delete_mapfile(updated_map)


    def test_delete(self):
        """DELETE /mapfiles/id: Delete an existing mapfile owned by the current
        user. Deletion of the map entry in db and remove mapfile from filesystem. """
        # Create new mapfile for this test
        filename = h.gen_mapname()
        map = create_mapfile('Dummy mapfile name', filename)
        # login as admin to be allowed to access /mapfiles/1
        log_in(self.app, 'enduser', 'password')

        # delete request that must be tested
        response = self.app.delete(url('MapFiles', id=map.id))

        assert not(os.path.exists(os.path.join(config['mapfiles_dir'], map.filepath)))
        deleted_map = model.meta.Session.query(model.Map).get(map.id)
        assert deleted_map is None

        # assert mapfile doesn't still exist
        response = self.app.delete(url('MapFiles', id=2), status=404)

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.delete(url('MapFiles', id=map.id), status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"


    def test_download(self):
        """ GET /mapfiles/id/download: Download the mapfile as an attachment. """
        # Create new mapfile for this test
        filename = h.gen_mapname()
        map = create_mapfile('Dummy mapfile name', filename)
        # login as admin to be allowed to access /mapfiles/1
        log_in(self.app, 'enduser', 'password')

        response = self.app.get(url(controller='mapfiles', action='download_mapfile', id=map.id))
        assert response.content_type == 'text/plain'
        assert response.body.startswith('MAP')
        assert response.headers['content-disposition'] == 'attachment; filename=%s' \
                %os.path.join(config['mapfiles_dir'], filename)

        # test redirection to /signin when log out
        log_out(self.app)
        response = self.app.get(url(controller='mapfiles', action='download_mapfile', id=map.id),
                status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

        # Clean the test mapfile
        delete_mapfile(map)

