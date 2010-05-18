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

import simplejson 

from studio.tests import *
from studio.model import *
from studio.tests.lib.helpers import log_in, log_out
from studio.lib.provisionning import create_layertemplate

class TestLayertemplatesController(TestController):

    def setUp(self):
        self._clean_layertemplates()
        log_in(self.app, 'enduser', 'password')

    def tearDown(self):
        self._clean_layertemplates()
    
    def test_index(self):
        self._create_layertemplates()
        response = self.app.get(url('layertemplates'))
        assert response.response.content_type == 'application/json'
        response = simplejson.loads(response.response._body)
        assert isinstance(response, dict)
        r = response['layertemplates']
        assert isinstance(r, list)
        assert len(r) == 2
        assert 'comment' in r[0]
        assert 'href' in r[0]
        assert 'id' in r[0]
        assert 'name' in r[0]

    def test_create(self):
        params = {'name': 'layertemplate3',
                  'comment': 'comment for layertemplate3',
                  'json': {'g': 1, 'h': 2, 'i': 3}}
        response = self.app.post(url('layertemplates'),
                                 params = simplejson.dumps(params),
                                 content_type='application/json')
        results = meta.Session.query(LayerTemplate).all()
        assert len(results) == 1
        assert results[0].id == 1
        assert results[0].name == 'layertemplate3'
        assert results[0].comment == 'comment for layertemplate3'
        assert results[0].json['g'] == 1
        assert results[0].json['h'] == 2
        assert results[0].json['i'] == 3
        
    def test_update(self):
        self._create_layertemplates()
        params = {'name': 'layertemplate3',
                  'comment': 'comment for layertemplate3',
                  'json': {'j': 4, 'k': 5, 'l': 6}}     
        response = self.app.put(url('LayerTemplates', id=2),
                                params = simplejson.dumps(params),
                                content_type='application/json')
        results = meta.Session.query(LayerTemplate).all()
        assert len(results) == 2
        assert results[1].id == 2
        assert results[1].name == 'layertemplate3'
        assert results[1].comment == 'comment for layertemplate3'
        assert results[1].json['j'] == 4
        assert results[1].json['k'] == 5
        assert results[1].json['l'] == 6
       
    def test_delete(self):
        self._create_layertemplates()
        response = self.app.delete(url('LayerTemplates', id=1))
        results = meta.Session.query(LayerTemplate).all()
        assert len(results) == 1
        assert results[0].id == 2
        assert results[0].name == 'layertemplate2'
        assert len(results[0].json['test']) == 2
        
    def test_show(self):
        self._create_layertemplates()
        response = self.app.get(url('LayerTemplates', id=1))
        assert response.response.content_type == 'application/json'
        result = simplejson.loads(response.response._body)
        assert result['id'] == 1
        assert result['name'] == 'layertemplate1'
        json = result['json']
        print response.response._body
        assert json[0]['a'] == 12

    def _create_layertemplates(self):
        create_layertemplate('layertemplate1', 'comment for layertemplate1', [{'a': 12, 'b': 34}, {'c': 56}])
        create_layertemplate('layertemplate2', 'comment for layertemplate2', {'test': [{'d': 7, 'e': 8}, {'f': 9}]})

    def _clean_layertemplates(self):
        meta.Session.query(LayerTemplate).delete()
        meta.Session.commit()
