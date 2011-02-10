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

import getpass

from pylons.util import PylonsInstaller
from paste.script.templates import var
from paste.script.util import secret


class StudioInstaller(PylonsInstaller):

    def config_content(self, command, vars):
        """
        Called by ``self.write_config``, this returns the text content
        for the config file, given the provided variables.
        """
        settable_vars = [
                var('db_url', 'Database url for sqlite, postgres or mysql', 
                    default='sqlite:///%(here)s/studio.db'),
                var('ms_url','Url to the mapserv CGI',
                    default='http://localhost/cgi-bin/mapserv'),
                var('admin_password','Password for default admin user',
                    default=secret.secret_string(length=8))
        ]

        for svar in settable_vars:
            if command.interactive:
                prompt = 'Enter %s' % svar.full_description()
                response = command.challenge(prompt, svar.default, svar.should_echo)
                vars[svar.name] = response
            else:
                if not vars.has_key(svar.name):
                    vars[svar.name] = svar.default

        vars['cookie_secret'] = secret.secret_string()

        # call default pylons install
        return super(StudioInstaller, self).config_content(command, vars)

