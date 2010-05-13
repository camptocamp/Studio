"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to both as 'h'.
"""
# Import helpers as desired, or define your own, ie:
# from webhelpers.html.tags import checkbox, password

import string
import os
import shutil
from tempfile import NamedTemporaryFile

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

def tofile(field_storage):
    dstfile = NamedTemporaryFile()
    shutil.copyfileobj(field_storage.file, dstfile)
    field_storage.file.close()
    dstfile.flush()
    
    return dstfile
