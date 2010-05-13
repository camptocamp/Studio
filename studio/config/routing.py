"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper

def make_map():
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'], explicit=True)
    map.minimization = False
    
    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    # CUSTOM ROUTES HERE

    # mapfiles routes
    map.connect('/mapfiles/default', controller='mapfiles', action='get_default_mapfile') 
    map.resource('MapFiles','mapfiles') 
    map.connect('/mapfiles/{id}/symbols', controller='mapfiles', action='get_symbols')
    map.connect('/mapfiles/{id}/fonts', controller='mapfiles', action='get_fonts')
    map.connect('/mapfiles/{id}/download', controller='mapfiles', action='download_mapfile') 
    map.connect('/mapfiles/{id}/wms', controller='mapfiles', action='wms_proxy') 

    # datastores routes
    map.resource('DataStores', 'datastores')

    # datasources routes
    map.connect('/datastores/{datastore_id}/datasources',
                controller='datasources', conditions={'method': ['POST']}, action='create')
    map.connect('/datastores/{datastore_id}/datasources',
                controller='datasources', action='index')
    map.connect('/datastores/{datastore_id}/datasources/{datasource_id}',
                controller='datasources', action='show')
    map.connect('/datastores/{datastore_id}/datasources/{datasource_id}/columns',
                controller='datasources', action='showcolumns')
    map.connect('/datastores/{datastore_id}/datasources/{datasource_id}/mapfile',
                controller='datasources', action='showmapfile')

    # layertemplates routes
    map.resource('LayerTemplates', 'layertemplates')

    # auth routes
    map.connect('/signin', controller='main', action='signin')
    map.connect('/signout', controller='main', action='signout')

    # default route for root ;)
    map.connect('/', controller='main', action='index')
    map.connect('/js/layout.js', controller='main', action='layout')

    map.connect('/{controller}/{action}')
    map.connect('/{controller}/{action}/{id}')


    return map
