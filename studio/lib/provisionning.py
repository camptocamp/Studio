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

import os
from pylons import config
from studio.model import meta, User, LayerTemplate, Map
from studio.lib.mapserializer import Mapfile

from sqlalchemy.orm import join
from sqlalchemy import and_, func

# create/delete user helpers

def create_user(name, login, password):
    user = User()
    user.name = name
    user.login = login
    user.password = password
    meta.Session.add(user)
    meta.Session.commit()
    return user

def delete_user_by_id(id):
    user = meta.Session.query(User).get(id)
    delete_user(user)

def delete_user_by_login(login):
    user = meta.Session.query(User).filter(User.login==login).one()
    delete_user(user)

def delete_user(user):
    if user is not None:
        meta.Session.delete(user)
        meta.Session.commit()

def update_user_by_id(by_id, name=None, login=None, password=None):
    user = meta.Session.query(User).get(by_id)
    update_user(user, name, login, password)

def update_user_by_login(by_login, name=None, login=None, password=None):
    user = meta.Session.query(User).filter(User.login==by_login).one()
    update_user(user, name, login, password)

def update_user(user, name=None, login=None, password=None):
    if user is not None:
        if name is not None:
            user.name = name
        if login is not None:
            user.login = login
        if password is not None:
            user.password = password
        meta.Session.commit()

# create/delete layertemplate helpers

def create_layertemplate(lt_name, lt_comment, json, user_id=2):
    lt = LayerTemplate(lt_name, lt_comment, json, user_id)
    meta.Session.add(lt)
    meta.Session.commit()
    return lt

def delete_layertemplate_by_id(id):
    lt = meta.Session.query(LayerTemplate).get(id)
    delete_layertemplate(lt)

def delete_layertemplate(lt):
    if lt is not None:
        # db removal of layertemplate
        meta.Session.delete(lt)
        meta.Session.commit()

# create/delete mapfile helpers

def create_mapfile(mapfile_name, pathname, user_id=2):
    # copy test mapfile dummy_mapfile.map and change fontset and symbolset paths
    # so that it matches user environnement
    mapfile = Mapfile()
    mapfile.from_file(os.path.join(config['mapserver_dir'], 'dummy_mapfile.map'))
    mapfile.set_name(mapfile_name)
    mapfile = change_mapfile_paths(mapfile)
    mapfile.to_file(os.path.join(config['mapfiles_dir'], pathname))
    assert os.path.exists(os.path.join(config['mapfiles_dir'], pathname))
    # db insertion of new mapfile
    map = Map(mapfile_name, pathname, user_id)
    meta.Session.add(map)
    meta.Session.commit()
    return map

def delete_mapfile_by_id(id):
    map = meta.Session.query(Map).get(id)
    delete_mapfile(map)

def delete_mapfile(map):
    if map is not None:
        # remove test mapfile from filesystem
        if os.path.exists(os.path.join(config['mapfiles_dir'], map.filepath)):
            os.unlink(os.path.join(config['mapfiles_dir'], map.filepath))
            assert not os.path.exists(os.path.join(config['mapfiles_dir'], map.filepath))
        # db removal of mapfile
        meta.Session.delete(map)
        meta.Session.commit()


def change_mapfile_paths(mapfile):
    # change fontset path so that it matches user environnement
    dict = mapfile.to_dict()
    dict['fontset'] = os.path.join(config['mapserver_dir'], dict['fontset'])
    dict['symbolset'] = os.path.join(config['mapserver_dir'], dict['symbolset'])
    mapfile.from_dict(dict)
    return mapfile
