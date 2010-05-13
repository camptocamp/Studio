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
