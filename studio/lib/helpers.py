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

"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to both as 'h'.
"""
# Import helpers as desired, or define your own, ie:
# from webhelpers.html.tags import checkbox, password

import string
import os

from random import choice

from pylons import config
from routes import url_for
from webhelpers.html.tags import stylesheet_link

from webhelpers.html import literal

def gen_mapname():
    """ Generate a uniq mapfile pathname. """
    filepath = None
    while (filepath is None) or (os.path.exists(os.path.join(config['mapfiles_dir'], filepath))):
        filepath = '%s.map' % _gen_string()
    return filepath

# random string generation
def _gen_string(length=8, chars=string.digits + string.letters):
    return ''.join([choice(chars) for i in range(length)])

