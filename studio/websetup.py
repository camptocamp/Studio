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

"""Setup the Studio application"""
import logging
import os.path

from pylons import config

from studio.config.environment import load_environment
from studio import model
from studio.lib.mapserializer import create_default_mapfile
from studio.lib.datasource_discovery import DataStore, DataSource
from studio.lib.colorthemer import QualitativePalette

log = logging.getLogger(__name__)

def setup_app(command, conf, vars):
    """Place any commands to setup studio here"""
    load_environment(conf.global_conf, conf.local_conf)

    # Merge and minify JavaScript code
    input_file = config['js_tmpl']
    public_dir = config['pylons.paths']['static_files']
    output_file = os.path.join(public_dir, 'js', 'Studio', 'studio-all.js')
    _merge_js(input_file, public_dir, output_file)
    log.info('JavaScript successfully merged and minified in ' + output_file)

    # Load the models
    from studio.model import meta
    meta.metadata.bind = meta.engine

    filename = os.path.split(conf.filename)[-1]
    if filename == 'test.ini':
        # Permanently drop any existing tables
        log.info("Dropping existing tables...")
        meta.metadata.drop_all(checkfirst=True)

    # Create the tables if they aren't there already
    meta.metadata.create_all(checkfirst=True)

    # Create permissions
    # datastores permissions
    perm_create_update_datastores = model.Permission()
    perm_create_update_datastores.name = 'create_update_datastores'
    meta.Session.add(perm_create_update_datastores)
    perm_view_datastores = model.Permission()
    perm_view_datastores.name = 'view_datastores'
    meta.Session.add(perm_view_datastores)
    # datasources permissions
    perm_view_datasources = model.Permission()
    perm_view_datasources.name = 'view_datasources'
    meta.Session.add(perm_view_datasources)
    perm_create_datasources = model.Permission()
    perm_create_datasources.name = 'create_datasources'
    meta.Session.add(perm_create_datasources)
    # mapfiles permissions
    perm_create_update_mapfiles = model.Permission()
    perm_create_update_mapfiles.name = 'create_update_mapfiles'
    meta.Session.add(perm_create_update_mapfiles)
    perm_view_mapfiles = model.Permission()
    perm_view_mapfiles.name = 'view_mapfiles'
    meta.Session.add(perm_view_mapfiles)
    # layertemplates permissions
    perm_create_update_layertemplates = model.Permission()
    perm_create_update_layertemplates.name = 'create_update_layertemplates'
    meta.Session.add(perm_create_update_layertemplates)
    perm_view_layertemplates = model.Permission()
    perm_view_layertemplates.name = 'view_layertemplates'
    meta.Session.add(perm_view_layertemplates)

    # Create group admin
    admin_gp = model.Group()
    admin_gp.name = 'admin'
    admin_gp.permissions.append(perm_create_update_datastores)
    admin_gp.permissions.append(perm_view_datastores)
    admin_gp.permissions.append(perm_view_datasources)
    admin_gp.permissions.append(perm_create_datasources)
    admin_gp.permissions.append(perm_create_update_mapfiles)
    admin_gp.permissions.append(perm_view_mapfiles)
    admin_gp.permissions.append(perm_create_update_layertemplates)
    admin_gp.permissions.append(perm_view_layertemplates)
    meta.Session.add(admin_gp)

    # Create group enduser
    enduser_gp = model.Group()
    enduser_gp.name = 'enduser'
    enduser_gp.permissions.append(perm_view_datastores)
    enduser_gp.permissions.append(perm_view_datasources)
    enduser_gp.permissions.append(perm_create_update_mapfiles)
    enduser_gp.permissions.append(perm_view_mapfiles)
    enduser_gp.permissions.append(perm_create_update_layertemplates)
    enduser_gp.permissions.append(perm_view_layertemplates)
    meta.Session.add(enduser_gp)

    # Create user admin
    admin = model.User()
    admin.name = 'Admin'
    admin.login = 'admin'
    admin.password = config['admin_password']
    admin.groups.append(admin_gp)
    meta.Session.add(admin)

    if filename == 'test.ini':
        # create enduser user for test purpose only
        enduser = model.User()
        enduser.name = 'Test User'
        enduser.login = 'enduser'
        enduser.password = 'password'
        enduser.groups.append(enduser_gp)
        meta.Session.add(enduser)

    mfdir = config['mapfiles_dir']
    if not os.path.exists(mfdir):
        os.makedirs(mfdir, 0755)

    if 'default_datastore_postgis' in config:
        # Create default datastore
        datastore = model.DataStore('default (postgis)', 'postgis', config['default_datastore_postgis'])
        meta.Session.add(datastore)
        meta.Session.flush()

    if 'default_datastore_dir' in config:
        # Create default datastore
        datastore = model.DataStore('default (directory)', 'directory', config['default_datastore_dir'])
        meta.Session.add(datastore)
        meta.Session.flush()

        # Create dummy mapfile
        mapfile = create_default_mapfile()
        dict = mapfile.to_dict()
        ds = DataStore(datastore.ogrstring)
        dsources = ds.get_datasources()
        palette = QualitativePalette(len(dsources)).get_palette()
        for dss in dsources:
            if dss.type == 'RASTER':
                print "adding %s datasource"%dss.name
                l = _make_mapfile_layer(datastore.id,dss)
                if 'projection' in l:
                    dict['projection'] = l['projection']
                dict['layers'].append(l)
        for dss in dsources:
            if dss.type == 'POLYGON':
                print "adding %s datasource"%dss.name
                color = palette.pop(0)
                l = _make_mapfile_layer(datastore.id,dss)
                if 'projection' in l:
                    dict['projection'] = l['projection']
                l['classes'][0]['styles'][0]['color']=color
                dict['layers'].append(l)
        for dss in dsources:
            if dss.type == 'LINE':
                print "adding %s datasource"%dss.name
                color = palette.pop(0)
                l = _make_mapfile_layer(datastore.id,dss)
                if 'projection' in l:
                    dict['projection'] = l['projection']
                l['classes'][0]['styles'][0]['color']=color
                dict['layers'].append(l)
        for dss in dsources:
            if dss.type == 'POINT':
                print "adding %s datasource"%dss.name
                color = palette.pop(0)
                l = _make_mapfile_layer(datastore.id,dss)
                if 'projection' in l:
                    dict['projection'] = l['projection']
                l['classes'][0]['styles'][0]['color']=color
                dict['layers'].append(l)
        if 'projection' not in dict:
            dict['projection']="init=epsg:4326"
        mapfile.from_dict(dict)
        mapfile.to_file(os.path.join(config['mapfiles_dir'], 'dummy_mapfile.map'))

        # Create dummy_mapfile in db, owned by user 'admin'
        map = model.Map('dummy_mapfile', 'dummy_mapfile.map', 1)
        model.meta.Session.add(map)

    # Commit the new objects into the database
    meta.Session.commit()

    log.info("Data successfully set up")

def _make_mapfile_layer(datastoreid, datasource):
    l = datasource.get_mapfile()
    l['group']='default'
    if 'metadata' not in l:
        l['metadata']={}
    l['metadata']['datastoreid']=str(datastoreid)
    l['metadata']['datasourceid']=datasource.getHash()
    return l

def _merge_js(input_file, input_dir, output_file):
    """ Call into the merge_js module to merge the js files
    and minify the code. """
    from studio.lib.buildjs import merge_js
    merge_js.main(input_file, input_dir, output_file)
