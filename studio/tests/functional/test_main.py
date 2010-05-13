from urlparse import urlparse

from studio.tests import *
from studio import model
from studio.tests.lib.helpers import log_in, log_out

class TestMainController(TestController):

    def test_index(self):
        log_in(self.app, 'enduser', 'password')
        response = self.app.get(url(controller='main', action='index'), status=200)
        assert response.body.find('<script type="text/javascript" src="/js/layout.js"></script>') >= 0
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
        assert follow_response.body.find('<script type="text/javascript" src="/js/layout.js"></script>') >= 0
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

