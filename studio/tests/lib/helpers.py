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

from pylons import url
from tempfile import mkdtemp
from studio.model import *
import simplejson

# common helper functions for tests

# login/logout helpers
def log_in(app, login, password):
    response = app.get(url('/login'),
            params={
                'login': login,
                'password': password,
                })
    assert response.status.startswith('302 ')

def log_out(app):
    response = app.get(url('/logout'))
    assert response.status.startswith('302 ')

# datastore helpers
def create_tmp_datastore(app):
    name = 'unit test datastore'
    params = {
        'name': name,
        'type': 'directory',
        'ogrstring': mkdtemp(prefix='studiotests')
        }
    app.post(url('datastores'),
             params = simplejson.dumps(params),
             content_type='application/json',
             status=201)
    results = meta.Session.query(DataStore).filter(DataStore.name == name).all()
    assert len(results) == 1
    return results[0].id
    
def delete_tmp_datastore(app, datastore_id):
    app.delete(url('DataStores', id=datastore_id),
               status=204)
