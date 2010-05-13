from pylons import config

from studio.tests import *
from studio.model import DataStore
from studio.model import meta
from studio.tests.lib.helpers import log_in, log_out, create_tmp_datastore, delete_tmp_datastore
import os
import simplejson

class TestDatasourcesController(TestController):

    def setUp(self):
        # insert a datastore in the datastore table
        meta.Session.add(
            DataStore('datastore1', 'directory', config['default_datastore_dir']),
            )
        meta.Session.commit()

    def tearDown(self):
        # empty the datastore table
        meta.Session.query(DataStore).delete()
        meta.Session.commit()

    def test_index(self):
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(
            url(controller='datasources', action='index', datastore_id=1),
            )
        assert response.response.content_type == 'application/json'
        response = simplejson.loads(response.response._body)
        assert isinstance(response, dict)
        r = response['datasources']
        assert isinstance(r, list)
        assert 'text' in r[0]
        assert 'id' in r[0]
        assert 'leaf' in r[0]
        assert 'type' in r[0]
        log_out(self.app)
        # test anonymous user
        response = self.app.get(
            url(controller='datasources', action='index', datastore_id=1),
            status=302,
            )
        assert response.location.find('signin') >= 0

    def test_index_404(self):
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(
            url(controller='datasources', action='index', datastore_id='foobar'),
            status=404
            )
        log_out(self.app)

    def test_show(self):
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(
            url(controller='datasources', action='index', datastore_id=1),
            )
        response = simplejson.loads(response.response._body)
        assert isinstance(response, dict)
        datasources = response['datasources']
        assert isinstance(datasources, list)
        # let's test with datasource "TM_WORLD_BORDERS_SIMPL-0.3"
        datasource_id = "3dfa880a8e37bcc97ff8bbeb9aff7852"
        response = self.app.get(
            url(controller='datasources', action='show', datastore_id=1, datasource_id=datasource_id),
            )
        assert response.response.content_type == 'application/json'
        log_out(self.app)
        # test anonymous user
        response = self.app.get(
            url(controller='datasources', action='show', datastore_id=1, datasource_id=datasource_id),
            status=302
            )
        assert response.location.find('signin') >= 0

    
    def test_show_mapfile(self):
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(
            url(controller='datasources', action='index', datastore_id=1),
            )
        response = simplejson.loads(response.response._body)
        assert isinstance(response, dict)
        datasources = response['datasources']
        assert isinstance(datasources, list)
        # let's test with datasource "TM_WORLD_BORDERS_SIMPL-0.3"
        datasource_id = "3dfa880a8e37bcc97ff8bbeb9aff7852"
        response = self.app.get(
            url(controller='datasources', action='showmapfile', datastore_id=1, datasource_id=datasource_id),
            )
        assert response.response.content_type == 'application/json'
        response = simplejson.loads(response.response._body)
        assert isinstance(response, dict)
        assert response['type']=='polygon'
        log_out(self.app)
        # test anonymous user
        response = self.app.get(
            url(controller='datasources', action='showmapfile', datastore_id=1, datasource_id=datasource_id),
            status=302
            )
        assert response.location.find('signin') >= 0
    
    def test_show_columns(self):
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(
            url(controller='datasources', action='index', datastore_id=1),
            )
        response = simplejson.loads(response.response._body)
        assert isinstance(response, dict)
        datasources = response['datasources']
        assert isinstance(datasources, list)
        # let's test with datasource "TM_WORLD_BORDERS_SIMPL-0.3"
        datasource_id = "3dfa880a8e37bcc97ff8bbeb9aff7852"
        response = self.app.get(
            url(controller='datasources', action='showcolumns', datastore_id=1, datasource_id=datasource_id),
            )
        assert response.response.content_type == 'application/json'
        response = simplejson.loads(response.response._body)
        assert 'columns' in response
        found_pop_column = False
        for column in response['columns']:
                if column['name'] == 'POP2005':
                    found_pop_column = True
        assert found_pop_column == True
        log_out(self.app)
        # test anonymous user
        response = self.app.get(
            url(controller='datasources', action='showcolumns', datastore_id=1, datasource_id=datasource_id),
            status=302
            )
        assert response.location.find('signin') >= 0

    def test_create(self):
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        single_file = [('datasources', os.path.join(data_dir, 'single_file'))]
        zip_file = [('datasources', os.path.join(data_dir, 'zip_archive.zip'))]
        tar_file = [('datasources', os.path.join(data_dir, 'tar_archive.tar.gz'))]

        log_in(self.app, 'admin', 'password')
        # create a new datastore for this test
        datastore_id = create_tmp_datastore(self.app)
        
        self.app.post(url(controller='datasources', action='create', datastore_id=datastore_id),
                      upload_files=single_file, status=201)

        self.app.post(url(controller='datasources', action='create', datastore_id=datastore_id),
                      upload_files=zip_file, status=201)

        self.app.post(url(controller='datasources', action='create', datastore_id=datastore_id),
                      upload_files=tar_file, status=201)

        delete_tmp_datastore(self.app, datastore_id)
        log_out(self.app)       
        # test anonymous user
#         self.app.post(url(controller='datasources', action='create', datastore_id=datastore_id),
#                       upload_files=tar_file, status=201)
        

    def test_show_404(self):
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(
            url(controller='datasources', action='show', datastore_id="foo", datasource_id=1),
            status=404
            )
        log_out(self.app)
        #response = self.app.get(
        #    url(controller='datasources', action='show', datastore_id=1, datasource_id="foobar"),
        #    status=404
        #    )
