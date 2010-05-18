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


from studio.lib.datasource_discovery import *

import pylons

def ogr_list(ogr_string):
    dsa = discover_datasources(ogr_string)
    for ds in dsa:
        dsc = discover_datasource_columns(ogr_string,ds['hash'])
        
datadir = pylons.config['default_datastore_dir']
        
def test_directory():
    dsa = discover_datasources(datadir)
    found_world = False
    found_raster = False
    for ds in dsa:
        print ds
        if ds['text'] == 'TM_WORLD_BORDERS_SIMPL-0.3' and ds['type'] == 'POLYGON':
            found_world = True
        if ds['text'] == 'bluemarble.tiff' and ds['type'] == 'RASTER':
            found_raster = True
    assert found_world == True and found_raster == True

def test_shapefile():
    dsa = discover_datasources(datadir)
    found_pop_column = False
    for ds in dsa:
        if ds['text'] == 'TM_WORLD_BORDERS_SIMPL-0.3':
            dsc = discover_datasource_columns(datadir,ds['id'])
            print dsc
            for column in dsc:
                if column['name'] == 'POP2005':
                    found_pop_column = True
    assert found_pop_column == True


#pgdatasource = pylons.config['default_datastore_postgis']

# def test_postgis_import():
#     store = DataStore(pgdatasource)
#     src_store = DataStore(datadir)
#     datasources = src_store.get_datasources()
#     ds = None
#     for dds in datasources:
#         if dds.name == "TM_WORLD_BORDERS_SIMPL-0.3":
#             ds = dds
# 
#     assert ds is not None
#     store.import_datasource(ds)
