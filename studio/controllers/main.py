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
import os

from pylons import request, response, session, config, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.i18n.translation import _, set_lang, LanguageError

from repoze.what.plugins.pylonshq import ActionProtector, is_met
from repoze.what.predicates import Not, NotAuthorizedError, not_anonymous, has_all_permissions

from studio.lib.base import BaseController, render
from studio.model import Group, User, Map, meta
from studio.lib import helpers as h
from studio.lib.mapserializer import create_default_mapfile, Mapfile

log = logging.getLogger(__name__)

class MainController(BaseController):

    def _isLangAvailable(self, lang):
        if not hasattr(self, 'available_languages'):
            localedir = os.path.join(config['pylons.paths']['root'], 'i18n')
            self.available_languages = [f for f in os.listdir(localedir) if (len(f) == 2 and os.path.isdir(os.path.join(localedir, f)))]
        return lang in self.available_languages


    def __before__(self):
        if 'lang' in request.params and self._isLangAvailable(request.params.getone('lang')):
            lang = request.params.getone('lang')
            session['lang'] = lang

        if 'lang' not in session:
            # get from user agent
            for language in request.languages:
                lang = language[0:2]
                if self._isLangAvailable(lang):
                    session['lang'] = lang
                    break

        if 'lang' in session:
            try:
                set_lang(session['lang'])
            except LanguageError:
                # remove lang from session if an error occured
                del session['lang']
            session.save()


    @ActionProtector(not_anonymous())
    def index(self):
        c.user = request.environ.get('repoze.what.credentials')['repoze.what.userid']
        c.lang = session['lang']
        return render("/index.html")

    def signin(self):
        if is_met(not_anonymous()):
            c.user = request.environ.get('repoze.what.credentials')['repoze.what.userid']
        return render("/signin.html")

    @ActionProtector(Not(not_anonymous()))
    def register(self):
        # ensure a login and password are not null
        if ('login' not in request.params or request.params['login'] == '') or \
           ('password' not in request.params or request.params['password'] == ''):
            session['flash'] = _('Login or password should not be empty. Please register again.')
            session.save()
            redirect_to(controller='main', action='signin')

        # ensure a user with the same login does not exist
        user = meta.Session.query(User).filter(User.login==request.params['login']).all()
        if len(user) != 0:
            session['flash'] = _('The login "%s" is already in use. Please register again.') \
                    %request.params['login']
            session.save()
            redirect_to(controller='main', action='signin')

        # create a new user in default group
        gp = meta.Session.query(Group).filter(Group.name==config["default_group"]).one()
        new_user = User()
        new_user.name = request.params['login']
        new_user.login = request.params['login']
        new_user.password = request.params['password']
        new_user.groups.append(gp)
        meta.Session.add(new_user)

        # create a sample mapfile for this new user
        mapfile_name = "Sample mapfile"
        mapfile = create_default_mapfile()
        # special mapfile for demo site
        #mapfile = Mapfile()
        #mapfile.from_file(os.path.join(config['mapserver_dir'],'demo_mapfile.map'))
        dict = mapfile.to_dict()
        if 'projection' not in dict:
            dict['projection']="init=epsg:4326"
        mapfile.from_dict(dict)
        mapfile.set_name(mapfile_name)
        map_pathname = h.gen_mapname()
        mapfile.to_file(os.path.join(config['mapfiles_dir'], map_pathname))
        # create the map in db
        map = Map(mapfile_name, map_pathname)
        map.user = new_user
        meta.Session.add(map)

        meta.Session.commit()

        session['flash'] = _('You have just registered. Please log in to use Studio.')
        session.save()

        redirect_to(controller='main', action='signin')

    @ActionProtector(not_anonymous())
    def signout(self):
        session['flash'] = _('You have just logged out. Please log in again to use Studio.')
        session.save()
        redirect_to('/logout')

    @ActionProtector(not_anonymous())
    def layout(self):
        if is_met(has_all_permissions('view_datastores', 'create_update_datastores')):
            c.show_datastores_tab = True
        else:
            c.show_datastores_tab = False

        return render("/layout.js")
