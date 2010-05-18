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

import mapscript
from studio.lib.mapserializer import *
from pylons import config


def compare_maps(map1,map2):
    assert map1.name == map2.name
    assert map1.extent.minx == map2.extent.minx
    assert map1.extent.miny == map2.extent.miny
    assert map1.extent.maxx == map2.extent.maxx
    assert map1.extent.maxy == map2.extent.maxy
    assert map1.getProjection() == map2.getProjection()
    assert map1.fontset.filename == map2.fontset.filename
    assert map1.symbolset.filename == map2.symbolset.filename
    assert map1.imagetype == map2.imagetype
    assert map1.maxsize == map2.maxsize
    assert map1.resolution == map2.resolution
    assert map1.numlayers == map2.numlayers
    assert map1.width == map2.width
    assert map1.height == map2.height
    assert map1.units == map2.units
    compare_hashtable(map1.web.metadata,map2.web.metadata)
    compare_colors(map1.imagecolor,map2.imagecolor)
    compare_outputformats(map1.outputformat,map2.outputformat)
    for i in range(0,map1.numlayers):
        compare_layers(map1.getLayer(i),map2.getLayer(i))

def compare_outputformats(o1,o2):
    assert o1.name == o2.name
    assert o1.mimetype == o2.mimetype
    assert o1.driver == o2.driver
    assert o1.imagemode ==  o2.imagemode

def compare_hashtable(meta1,meta2):
    assert meta1.numitems == meta2.numitems
    key = meta1.nextKey(None)
    while key is not None:
        print "%s <> %s" % (meta1.get(key),meta2.get(key))
        assert meta1.get(key) == meta2.get(key)
        key = meta1.nextKey(key)
    key = meta2.nextKey(None)
    while key is not None:
        print "%s <> %s" % (meta1.get(key),meta2.get(key))
        assert meta1.get(key) == meta2.get(key)
        key = meta2.nextKey(key)

def compare_colors(color1,color2):
    assert color1.red == color2.red
    assert color1.green == color2.green
    assert color1.blue == color2.blue

def compare_layers(layer1,layer2):
    assert layer1.name == layer2.name
    assert layer1.classitem == layer2.classitem
    assert layer1.connectiontype == layer2.connectiontype
    assert layer1.connection == layer2.connection
    assert layer1.data == layer2.data
    assert layer1.dump == layer2.dump
    assert layer1.filteritem == layer2.filteritem
    assert layer1.getFilterString() == layer2.getFilterString()
    assert layer1.group == layer2.group
    assert layer1.labelcache == layer2.labelcache
    assert layer1.labelitem == layer2.labelitem
    assert layer1.labelmaxscaledenom == layer2.labelmaxscaledenom
    assert layer1.labelminscaledenom == layer2.labelminscaledenom
    assert layer1.maxscaledenom == layer2.maxscaledenom
    assert layer1.minscaledenom == layer2.minscaledenom
    compare_hashtable(layer1.metadata,layer2.metadata)
    compare_colors(layer1.offsite,layer2.offsite)
    assert layer1.opacity == layer2.opacity
    assert layer1.postlabelcache == layer2.postlabelcache
    assert layer1.getProjection() == layer2.getProjection()
    assert layer1.sizeunits == layer2.sizeunits
    assert layer1.status == layer2.status
    assert layer1.template == layer2.template
    assert layer1.tileindex == layer2.tileindex
    assert layer1.tileitem == layer2.tileitem
    assert layer1.type == layer2.type
    assert layer1.units ==layer2.units
    assert layer1.numclasses == layer2.numclasses
    for i in range(0,layer1.numclasses):
        compare_classes(layer1.getClass(i),layer2.getClass(i))

def compare_classes(class1,class2):
    assert class1.getExpressionString() == class2.getExpressionString()
    compare_labels(class1.label,class2.label)
    assert class1.maxscaledenom == class2.maxscaledenom
    assert class1.minscaledenom == class2.minscaledenom
    assert class1.name == class2.name
    assert class1.getTextString() == class2.getTextString()
    assert class1.title == class2.title
    assert class1.numstyles == class2.numstyles
    for i in range(0,class1.numstyles):
        compare_styles(class1.getStyle(i),class2.getStyle(i))

def compare_labels(label1,label2):
    assert label1.autoangle ==label2.autoangle
    assert label1.autofollow == label2.autofollow
    assert label1.angle == label2.angle
    compare_colors(label1.backgroundcolor,label2.backgroundcolor)
    assert label1.buffer == label2.buffer
    compare_colors(label1.color,label2.color)
    assert label1.font == label2.font
    assert label1.force == label2.force
    assert label1.encoding == label2.encoding
    assert label1.mindistance == label2.mindistance
    assert label1.autominfeaturesize == label2.autominfeaturesize
    assert label1.minfeaturesize == label2.minfeaturesize
    compare_colors(label1.outlinecolor,label2.outlinecolor)
    assert label1.position == label2.position
    assert label1.priority == label2.priority
    assert label1.size == label2.size
    assert label1.type ==label2.type

def compare_styles(style1,style2):
    compare_colors(style1.backgroundcolor,style2.backgroundcolor)
    compare_colors(style1.color,style2.color)
    compare_colors(style1.outlinecolor,style2.outlinecolor)
    assert style1.maxsize == style2.maxsize
    assert style1.minsize == style2.minsize
    assert style1.maxwidth == style2.maxwidth
    assert style1.minwidth == style2.minwidth
    assert style1.opacity == style2.opacity
    assert style1.size == style2.size
    assert style1.symbol == style2.symbol
    assert style1.width == style2.width


def create_default_map():
    map = mapscript.mapObj()
    map.setExtent(-90,-180,90,180)
    map.setFontSet(config['mapserver_dir']+'/fonts.lst')
    map.setSize(400,300)
    if mapscriptutils.SUPPORTS_AGG:
        of = create_agg_png_outputformat()
        map.appendOutputFormat(of)
        map.selectOutputFormat(of.name)
    else:
        map.setImageType('png')

    map.imagecolor.setHex("#00ff00")
    map.maxsize = 2049
    map.name = "foomap"
    map.setProjection('+init=epsg:27572')
    map.resolution = 73
    map.setSymbolSet(config['mapserver_dir']+'/symbols.sym')
    map.units = mapscript.MS_KILOMETERS
    map.web.metadata.set("foo","bar")
    map.insertLayer(create_default_layer())
    return map

def create_default_layer():
    layer = mapscript.layerObj()
    layer.classitem = "fooitem"
    layer.data = "/path/to/shapefile"
    layer.dump = mapscript.MS_TRUE
    layer.filteritem = "foofilteritem"
    layer.setFilter("foofilter")
    layer.group = 'foogroup'
    layer.labelcache = mapscript.MS_OFF
    layer.labelitem = 'foolabelitem'
    layer.labelmaxscaledenom=1000
    layer.labelminscaledenom=100
    layer.maxscaledenom = 1000
    layer.minscaledenom = 100
    layer.metadata.set("fookey","foovalue")
    layer.name = "foobar"
    layer.offsite.setHex("#000001")
    layer.opacity=50
    layer.postlabelcache = mapscript.MS_TRUE
    layer.setProjection("+init=epsg:27572")
    layer.sizeunits = mapscript.MS_MILES
    layer.status = mapscript.MS_OFF
    layer.template = "footemplate"
    layer.tileindex = "/path/to/shp"
    layer.tileitem = "footileitem"
    layer.type = mapscript.MS_LAYER_POINT
    layer.units = mapscript.MS_DD
    layer.insertClass(create_default_class())

    return layer

def create_default_class():
    c = mapscript.classObj()
    c.setExpression("fooexpression")
    create_default_label(c.label)
    c.maxscaledenom = 2000
    c.minscaledenom = 100
    c.name = "fooname"
    c.setText("[footext]")
    c.title = "footitle"
    c.insertStyle(create_default_style())
    return c

def create_default_label(label):
    label.angle = 30
    label.backgroundcolor.setHex('#00ff00')
    label.buffer = 15
    label.color.setHex('#ff0000')
    label.font = "sc"
    label.force = mapscript.MS_TRUE
    label.encoding = "utf8"
    label.mindistance = 15
    label.minfeaturesize = 12
    label.outlinecolor.setHex('#aa00aa')
    label.position = mapscript.MS_AUTO
    label.priority = 5
    label.size = 8
    label.type = mapscript.MS_TRUETYPE

def create_default_style():
    style = mapscript.styleObj()
    style.backgroundcolor.setHex('#00ff00')
    style.color.setHex('#ff0000')
    style.outlinecolor.setHex('#aa00aa')
    style.size = 12
    style.symbol = 3
    style.width = 4
    return style
    

def run_map(mapobj):
    map = Mapfile()
    map.mapobj = mapobj
    map_dict = map.to_dict()
    map2 = Mapfile()
    map2.from_dict(map_dict)
    compare_maps(map.mapobj,map2.mapobj)


def test_simple_map():
    map = create_default_map()
    map.name = 'toto'
    run_map(map)

def test_raster_layer():
    map =create_default_map()
    layer = mapscript.layerObj()
    layer.type = mapscript.MS_LAYER_RASTER
    layer.name = "test raster"
    layer.data = "path/to/file.tif"
    layer.offsite.setRGB(255,0,0)
    run_map(map)

def test_connection_layer():
    map = create_default_map()
    layer = map.getLayer(0)
    if mapscriptutils.VERSION_MAJOR>5 or (mapscriptutils.VERSION_MAJOR==5 and mapscriptutils.VERSION_MINOR>=4):
        layer.setConnectionType(mapscript.MS_POSTGIS, "foo")
    else:
        layer.connectiontype = mapscript.MS_POSTGIS
    layer.connection = "host=localhost port=5432 dbname=cdc user=www-data password=www-data"
    run_map(map)

def test_layer_type():
    map = create_default_map()
    layer = map.getLayer(0)
    layer.type = mapscript.MS_LAYER_POINT
    print "point layer"
    run_map(map)
    layer.type = mapscript.MS_LAYER_LINE
    print "line layer"
    run_map(map)
    layer.TYPE = mapscript.MS_LAYER_POLYGON
    print "polygon layer"
    run_map(map)
    layer.TYPE = mapscript.MS_LAYER_ANNOTATION
    print "annotation layer"
    run_map(map)
    layer.TYPE = mapscript.MS_LAYER_RASTER
    print "raster layer"
    run_map(map)

def test_metadata():
    map = create_default_map()
    layer = map.getLayer(0)
    meta = layer.metadata
    
    meta.clear()
    print "no metadata"
    run_map(map)
    
    meta.set("foo","bar")
    print "foo=bar"
    run_map(map)
    
    meta.set("bar","baz")
    print "foo=bar , bar=baz"
    run_map(map)
    
def test_units():
    map = create_default_map()
    
    map.units = mapscript.MS_METERS
    print "meters"
    run_map(map)
   
    map.units = mapscript.MS_FEET
    print "feet"
    run_map(map)

    map.units = mapscript.MS_MILES
    print "miles"
    run_map(map)

    map.units = mapscript.MS_DD
    print "degrees"
    run_map(map)

    map.units = mapscript.MS_KILOMETERS
    print "kilometers"
    run_map(map)

def test_layer_status():
    map = create_default_map()
    layer = map.getLayer(0)
    
    layer.status=mapscript.MS_OFF
    print "status off"
    run_map(map)
    
    layer.status=mapscript.MS_ON
    print "status on"
    run_map(map)

    layer.status=mapscript.MS_DEFAULT
    print "status default"
    run_map(map)


