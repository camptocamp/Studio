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

import os, zipfile, tarfile, shutil

def extractall(archive, filename, dstdir):
    """ extract zip or tar content to dstdir"""
    
    if zipfile.is_zipfile(archive):
        z = zipfile.ZipFile(archive)
        for name in z.namelist():
            targetname = name
            # directories ends with '/' (on Windows as well)
            if targetname.endswith('/'):
                targetname = targetname[:-1]

            # don't include leading "/" from file name if present
            if targetname.startswith(os.path.sep):
                targetname = os.path.join(dstdir, targetname[1:])
            else:
                targetname = os.path.join(dstdir, targetname)                
            targetname = os.path.normpath(targetname)

            # Create all upper directories if necessary.    
            upperdirs = os.path.dirname(targetname)
            if upperdirs and not os.path.exists(upperdirs):
                os.makedirs(upperdirs)

            # directories ends with '/' (on Windows as well)
            if not name.endswith('/'):
                # copy file
                file(targetname, 'wb').write(z.read(name))

    elif tarfile.is_tarfile(archive):
        tar = tarfile.open(archive)
        tar.extractall(path=dstdir)
    else:
        # seems to be a single file, save it
        shutil.copyfile(archive, os.path.join(dstdir, filename))
