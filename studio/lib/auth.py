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

"""Auth middleware initialization"""
from urlparse import urlparse, urlunparse

from paste.httpexceptions import HTTPFound, HTTPUnauthorized
from paste.request import parse_formvars
from zope.interface import implements

from pylons import config
from repoze.who.interfaces import IChallenger
from repoze.who.interfaces import IIdentifier
from repoze.what.plugins.quickstart import setup_sql_auth

from studio import model


class BasicRedirectFormPlugin(object):
    """
    :class:BasicRedirectFormPlugin -like friendly form plugin without
    came_from and login counter feature.
    Developers will define post-login and/or post-logout pages.
    
    """
    implements(IChallenger, IIdentifier)
    
    def __init__(self, login_form_url, login_handler_path, post_login_url,
                 logout_handler_path, post_logout_url, rememberer_name):
        """
        
        :param login_form_url: The URL/path where the login form is located.
        :type login_form_url: str
        :param login_handler_path: The URL/path where the login form is
            submitted to (where it is processed by this plugin).
        :type login_handler_path: str
        :param post_login_url: The URL/path where the user should be redirected
            to after login (even if wrong credentials were provided).
        :type post_login_url: str
        :param logout_handler_path: The URL/path where the user is logged out.
        :type logout_handler_path: str
        :param post_logout_url: The URL/path where the user should be
            redirected to after logout.
        :type post_logout_url: str
        :param rememberer_name: The name of the repoze.who identifier which
            acts as rememberer.
        :type rememberer_name: str
        
        """
        self.login_form_url = login_form_url
        self.login_handler_path = login_handler_path
        self.post_login_url = post_login_url
        self.logout_handler_path = logout_handler_path
        self.post_logout_url = post_logout_url
        self.rememberer_name = rememberer_name
    
    # IIdentifier
    def identify(self, environ):
        
        if environ['PATH_INFO'] == self.login_handler_path:
            ## We are on the URL where repoze.who processes authentication. ##
            form = parse_formvars(environ)
            try:
                credentials = {
                    'login': form['login'],
                    'password': form['password']
                    }
            except KeyError:
                credentials = None
            
            # destination is the post-login page
            destination = self._get_full_path(self.post_login_url, environ)
            # all variables from query string are kept in query string
            destination = self._replace_qs(destination, environ.get('QUERY_STRING'))

            environ['repoze.who.application'] = HTTPFound(destination)
            return credentials

        elif environ['PATH_INFO'] == self.logout_handler_path:
            ##    We are on the URL where repoze.who logs the user out.    ##
            # let's throw an exception to get challenged
            environ['repoze.who.application'] = HTTPUnauthorized()
            return None
    
    # IChallenger
    def challenge(self, environ, status, app_headers, forget_headers):

        destination = self._get_full_path(self.login_form_url, environ)
        cookies = [(h,v) for (h,v) in app_headers if h.lower() == 'set-cookie']
        # Configuring the headers to be set:
        headers = forget_headers + cookies

        if environ['PATH_INFO'] == self.logout_handler_path:
            # Let's log the user out without challenging.
            # Redirect to a predefined "post logout" URL.
            destination = self._get_full_path(self.post_logout_url, environ)
        
        return HTTPFound(destination, headers=headers)

    # IIdentifier
    def remember(self, environ, identity):
        rememberer = self._get_rememberer(environ)
        return rememberer.remember(environ, identity)

    # IIdentifier
    def forget(self, environ, identity):
        rememberer = self._get_rememberer(environ)
        return rememberer.forget(environ, identity)
    
    def _get_rememberer(self, environ):
        rememberer = environ['repoze.who.plugins'][self.rememberer_name]
        return rememberer
    
    def _get_full_path(self, path, environ):
        """
        Return the full path to ``path`` by prepending the SCRIPT_NAME.
        
        If ``path`` is a URL, do nothing.
        
        """
        if path.startswith('/'):
            path = environ.get('SCRIPT_NAME', '') + path
        return path
    
    def _replace_qs(self, url, qs):
        """
        Replace the query string of ``url`` with ``qs`` and return the new URL.
        
        """
        url_parts = list(urlparse(url))
        url_parts[4] = qs
        return urlunparse(url_parts)
    
    def __repr__(self):
        return '<%s %s>' % (self.__class__.__name__, id(self))
    

def AuthMiddleware(app):
    """
    Add authentication and authorization middleware to the ``app``.
    """
    # url_for mustn't be used here because AuthMiddleware is built once at startup,
    # url path can be reconstructed only on http requests (based on environ)
    basic_redirect_form = BasicRedirectFormPlugin(login_form_url="/signin",
                                                  login_handler_path="/login",
                                                  post_login_url="/",
                                                  logout_handler_path="/logout",
                                                  post_logout_url="/signin",
                                                  rememberer_name="cookie")

    return setup_sql_auth(
            app,
            user_class = model.User,
            group_class = model.Group,
            permission_class = model.Permission,
            dbsession = model.meta.Session,
            form_plugin = basic_redirect_form,
            cookie_secret = config['cookie_secret'],
            translations = {
                'user_name': 'login',
                'users': 'users',
                'group_name': 'name',
                'groups': 'groups',
                'permission_name': 'name',
                'permissions': 'permissions',
                'validate_password': 'validate_password'},
            )

