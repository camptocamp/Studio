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

from urlparse import urlparse

from studio.tests import *
from studio import model
from studio.tests.lib.helpers import log_in, log_out

class TestMainController(TestController):

    def test_index(self):
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(url(controller='main', action='index'), status=200)
        assert response.body.find('<script type="text/javascript" src="/layout.js"></script>') >= 0
        log_out(self.app)

        # test without being logged in
        response = self.app.get(url(controller='main', action='index'), status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

    def test_signin(self):
        response = self.app.get(url(controller='main', action='signin'), status=200)

        # test bad user signin
        form_response = response.forms[0].submit()
        assert form_response.status.startswith('302 ')
        urlparsed = urlparse(form_response.location)
        assert urlparsed.path == '/' # we are redirected to "/"

        follow_response = form_response.follow()
        assert follow_response.status.startswith('302 ')
        urlparsed = urlparse(follow_response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"
        
        # test user signin
        response.forms[0].set('login', 'enduser')
        response.forms[0].set('password', 'password')
        form_response = response.forms[0].submit()
        assert form_response.status.startswith('302 ')
        urlparsed = urlparse(form_response.location)
        assert urlparsed.path == '/' # we are redirected to "/"

        follow_response = form_response.follow()
        assert follow_response.status.startswith('200 ')
        assert follow_response.body.find('<script type="text/javascript" src="/layout.js"></script>') >= 0
        log_out(self.app)

    def test_signout(self):
        log_in(self.app, 'enduser', 'password')
        # then test signout
        response = self.app.get(url(controller='main', action='signout'), status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/logout' # we are redirected to "logout"

        follow_response = response.follow()
        assert follow_response.status.startswith('302 ')
        urlparsed = urlparse(follow_response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

        # test you cannot signout twice
        response = self.app.get(url(controller='main', action='signout'), status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

    def test_layout(self):
        # test log in as enduser
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(url(controller='main', action='layout'), status=200)
        assert response.body.find('xtype: "studio.mm.chooser"') >= 0
        assert response.body.find('xtype: "studio.dm.chooser"') < 0
        log_out(self.app)

        # test log in as admin
        log_in(self.app, 'admin', 'password')
        response = self.app.get(url(controller='main', action='layout'), status=200)
        assert response.body.find('xtype: "studio.mm.chooser"') >= 0
        assert response.body.find('xtype: "studio.dm.chooser"') >= 0
        log_out(self.app)

        # test without being logged in
        response = self.app.get(url(controller='main', action='layout'), status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin' # we are redirected to "signin"

    def _delete_user(self, login):
        from studio.model import meta, User, Map
        user = meta.Session.query(User).filter(User.login == login).first()
        map = meta.Session.query(Map).filter(Map.user == user).first()
        meta.Session.delete(map)
        meta.Session.delete(user)
        meta.Session.commit()

    def test_register_empty_login_password(self):
        response = self.app.post(url(controller='main', action='register'),
                                 {'login': '', 'password': '', 'lang': 'en'},
                                 status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin'

        follow_response = response.follow()
        assert 'Login or password should not be empty' in follow_response

    def test_register(self):
        response = self.app.post(url(controller='main', action='register'),
                                 {'login': '_test_user_login',
                                  'password': '_test_user_password',
                                  'lang': 'en'},
                                 status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin'

        follow_response = response.follow()
        assert 'You have just registered' in follow_response

        from studio.model import meta, User, Map
        results = meta.Session.query(User).filter(User.login == '_test_user_login').all()
        assert len(results) == 1

        self._delete_user('_test_user_login')

    def test_register_long_password(self):
        password = '01234567890123456789012345678901234567890123456789'
        response = self.app.post(url(controller='main', action='register'),
                                 {'login': '_test_user_login',
                                  'password': password,
                                  'lang': 'en'},
                                 status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin'

        follow_response = response.follow()
        assert 'You have just registered' in follow_response

        self._delete_user('_test_user_login')

    def test_register_long_login(self):
        login = '0123456789012345678901234567890'
        response = self.app.post(url(controller='main', action='register'),
                                 {'login': login,
                                  'password': '_test_user_password',
                                  'lang': 'en'},
                                 status=302)
        urlparsed = urlparse(response.location)
        assert urlparsed.path == '/signin'

        follow_response = response.follow()
        assert 'Login should not exceed 30 characters' in follow_response
