import getpass

from pylons.util import PylonsInstaller
from paste.script.templates import var


class StudioInstaller(PylonsInstaller):

    def config_content(self, command, vars):
        """
        Called by ``self.write_config``, this returns the text content
        for the config file, given the provided variables.
        """
        settable_vars = [
                var('db_url', 'Database url for sqlite, postgres or mysql', 
                    default='sqlite:///studio.db'),
                var('ms_url','url to the mapserv CGI',
                    default='http://localhost/cgi-bin/mapserv')
        ]

        for svar in settable_vars:
            if command.interactive:
                prompt = 'Enter %s' % svar.full_description()
                response = command.challenge(prompt, svar.default, svar.should_echo)
                vars[svar.name] = response
            else:
                if not vars.has_key(svar.name):
                    vars[svar.name] = svar.default

        # call default pylons install
        return super(StudioInstaller, self).config_content(command, vars)

