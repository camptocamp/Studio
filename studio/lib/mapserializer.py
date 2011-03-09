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
from exceptions import AttributeError
import os
from types import *
import re

from pylons import config

from studio.lib import mapscriptutils

class Mapfile:
    _SYMBOL_NAME_REGEXP = re.compile("^mfs_([psf]+)_(.*)$")
    _STYLE_CHAR2NAME = {
        'p': 'isPoint',
        's': 'isStroke',
        'f': 'isFill'
    }

    def __init__(self):
        """ new mapfile from mapfile path"""
        self.mapobj = None

    def to_dict(self):
        return mapobj_to_dict(self.mapobj)

    def from_dict(self,obj):
        self.mapobj = mapscript.mapObj()
        self.mapobj.mappath = config['mapfiles_dir']
        update_mapobj_from_dict(self.mapobj,obj)

    def from_file(self, mapfile_path):
        self.mapobj = mapscript.mapObj(str(mapfile_path))

    def to_file(self, mapfile_path):
        if self.mapobj is None:
            raise AttributeError, 'self.mapobj is None'
        self.mapobj.save(mapfile_path)
    
    def set_name(self, name):
        if self.mapobj is None:
            raise AttributeError, 'self.mapobj is None'
        self.mapobj.name = name

    def get_name(self):
        if self.mapobj is None:
            raise AttributeError, 'self.mapobj is None'
        return self.mapobj.name

    def get_fonts(self):
        if self.mapobj is None:
            raise AttributeError, 'self.mapobj is None'
        fontset = self.mapobj.fontset.fonts
        fonts = []
        key = fontset.nextKey(None)
        while key is not None:
            fonts.append({'id': key, 'name': key})
            key = fontset.nextKey(key)
        return fonts

    def get_symbols(self):
        if self.mapobj is None:
            raise AttributeError, 'self.mapobj is None'
        symbolset = self.mapobj.symbolset
        symbols = []
        for i in range(1, symbolset.numsymbols):
            symbolobj = symbolset.getSymbol(i)
            symbols.append(self._create_symbol(i, symbolobj))
        return symbols
        
    def _create_symbol(self, id, symbolobj):
        """Creates the JSON representation of a symbol"""
        result = {'id': symbolobj.name, 'isPoint': False, 'isStroke': False, 'isFill': False}
        matcher = Mapfile._SYMBOL_NAME_REGEXP.match(symbolobj.name)
        if matcher:
            result['name'] = matcher.group(2)
            for c in matcher.group(1):
                field = Mapfile._STYLE_CHAR2NAME[c]
                result[field] = True
        else:
            result['name'] = symbolobj.name
            result['isPoint'] = result['isStroke'] = result['isFill'] = True
        return result

def create_agg_png_outputformat():
    aggof = mapscript.outputFormatObj('AGG/PNG')
    aggof.name = 'aggpng'
    aggof.driver = 'AGG/PNG'
    aggof.imagemode = mapscript.MS_IMAGEMODE_RGB
    aggof.mimetype = "image/png"
    return aggof

def create_agg_jpg_outputformat():
    aggof = mapscript.outputFormatObj('AGG/JPEG')
    aggof.name = 'aggjpg'
    aggof.driver = 'AGG/JPEG'
    aggof.imagemode = mapscript.MS_IMAGEMODE_RGB
    aggof.mimetype = "image/jpeg"
    return aggof


def create_default_mapfile():
    mapfile = Mapfile()
    map = mapscript.mapObj()
    if mapscriptutils.SUPPORTS_AGG:
        of = create_agg_png_outputformat()
        map.appendOutputFormat(of)
        map.selectOutputFormat(of.name)
        
        # we'd like to include an agg/jpeg outputformat here, but we can't
        # since mapserver's saveMap function only saves the currently selected
        # outputformat, not all of them
        
    else:
        map.selectOutputFormat('png')
    map.setExtent(-180,-90,180,90)
    map.setFontSet(os.path.join(config['mapserver_dir'],'fonts.lst'))
    map.setSymbolSet(os.path.join(config['mapserver_dir'],'symbols.sym'))
    map.setSize(400,300)
    map.web.metadata.set("ows_srs","epsg:4326 epsg:21781 epsg:2154")
    map.imagecolor.setHex("#ffffff")
    mapfile.mapobj = map
    return mapfile


def outputformatobj_to_dict(outputformatobj):
    of = {}
    of['name'] = outputformatobj.name
    of['driver'] = outputformatobj.driver
    of['imagemode'] = mapscriptutils.imagemodes[outputformatobj.imagemode]
    of['mimetype'] = outputformatobj.mimetype

    return of

def dict_to_outputformatobj(dict):
    ofo = mapscript.outputFormatObj(str(dict['driver']))
    ofo.name = dict['name']
    ofo.mimetype = dict['mimetype']
    ofo.imagemode = mapscriptutils.imagemodes.lookup(dict['imagemode'])
    ofo.inmapfile = mapscript.MS_TRUE
    return ofo
    
def mapobj_to_dict(mapobj):
    if mapobj is None:
        raise AttributeError, 'mapobj is None'

    map = {}
    map['name'] = mapobj.name
    map['extent'] = rectobj_to_dict(mapobj.extent)

    tmp =  mapobj.getProjection()
    if tmp is not None and tmp != "":
        map['projection'] = tmp
    
    map['fontset'] = mapobj.fontset.filename

    map['imagetype'] = mapobj.imagetype
   
    if mapobj.outputformat.inmapfile:
        map['outputformats'] = [outputformatobj_to_dict(mapobj.outputformat)]
    
    tmp = webobj_to_dict(mapobj.web)
    if tmp is not None:
        map['web']=tmp


    tmp = mapobj.maxsize
    if tmp != 2048:
        map['maxsize'] = tmp
    
    tmp = mapobj.resolution
    if tmp != 72:
        map['resolution'] = tmp
    
    #not settable
    #map['shapepath'] = mapobj.shapepath

    map['symbolset'] = mapobj.symbolset.filename
    
    map['units'] = mapscriptutils.units[mapobj.units]
    map['height'] = mapobj.height
    map['width'] = mapobj.width
    map['imagecolor'] = colorobj_to_dict(mapobj.imagecolor)
    map['layers'] = []
    numlayers = mapobj.numlayers
    for i in range(0,numlayers):
        map['layers'].append(layerobj_to_dict(mapobj.getLayer(i),mapobj))
    return map

def layerobj_to_dict(layerobj,mapobj):
    layer = {}
   
    tmp = layerobj.classitem
    if tmp is not None:
        layer['classitem'] = tmp
   
    tmp = layerobj.connectiontype
    if tmp != mapscript.MS_SHAPEFILE:
        layer['connectiontype']=mapscriptutils.connectiontypes[tmp]
        layer['connection']=layerobj.connection
 
    tmp =layerobj.data
    if tmp is not None:
        layer['data'] = tmp
    
    if layerobj.dump:
        layer['dump']=True

    tmp = layerobj.filteritem
    if tmp is not None:
        layer['filter'] = {}
        layer['filter']['item'] = tmp
        layer['filter']['value'] = layerobj.getFilterString()

    tmp = layerobj.group
    if tmp is not None:
        layer['group'] = tmp
    
    if layerobj.labelcache == mapscript.MS_OFF:
        layer['labelcache']=False
    
    tmp = layerobj.labelitem
    if tmp is not None:
        layer['labelitem'] = tmp
    
    tmp = layerobj.labelmaxscaledenom
    if tmp != -1:
        layer['labelmaxscaledenom']=tmp
    
    tmp = layerobj.labelminscaledenom
    if tmp != -1:
        layer['labelminscaledenom']=tmp
    
    tmp = layerobj.maxscaledenom
    if tmp != -1:
        layer['maxscaledenom']=tmp

    tmp = hashtableobj_to_dict(layerobj.metadata)
    if tmp is not None:
        layer['metadata']=tmp
    
    tmp = layerobj.minscaledenom
    if tmp != -1:
        layer['minscaledenom']=tmp

    layer['name'] = layerobj.name
    
    tmp = colorobj_to_dict(layerobj.offsite)
    if tmp is not None:
        layer['offsite'] = tmp
    
    layer['opacity'] = layerobj.opacity

    if layerobj.postlabelcache == mapscript.MS_TRUE:
        layer['postlabelcache'] = True
    
    tmp = layerobj.getProjection()
    if tmp is not None and tmp != '':
        layer['projection'] = tmp

    tmp = layerobj.sizeunits
    if tmp != mapscript.MS_PIXELS:
        layer['sizeunits'] = mapscriptutils.units[tmp]

    layer['status'] = mapscriptutils.status[layerobj.status]

    tmp = layerobj.symbolscaledenom
    if tmp >= 0:
        layer['symbolscaledenom'] = tmp

    tmp = layerobj.template
    if tmp:
        layer['template']=tmp
    
    tmp = layerobj.tileindex
    if tmp is not None:
        layer['tileindex']=tmp
        tmp = layerobj.tileitem
        if tmp != "location":
            layer['tileitem']=tmp

    layer['type'] = mapscriptutils.layertypes[layerobj.type] 
    
    tmp = layerobj.units
    if tmp != mapscript.MS_METERS:
        layer['units'] = mapscriptutils.units[tmp]

    numclasses = layerobj.numclasses
    if numclasses > 0:
        layer['classes']=[]
        for i in range(0,numclasses):
            layer['classes'].append(classobj_to_dict(layerobj.getClass(i),mapobj))

    return layer

def classobj_to_dict(classobj,mapobj):
    c = {}
  
    tmp = classobj.getExpressionString()
    if tmp is not None:
        c['expression'] = tmp
        
    tmp = labelobj_to_dict(classobj.label,mapobj)
    if tmp is not None:
        c['label']=tmp
 
    tmp = classobj.maxscaledenom
    if tmp != -1:
        c['maxscaledenom']=tmp

    tmp = classobj.minscaledenom
    if tmp != -1:
        c['minscaledenom']=tmp
        
    tmp = classobj.name
    if tmp is not None:
        c['name']=tmp

    tmp = classobj.getTextString()
    if tmp is not None:
        c['text'] = tmp
 
    tmp = classobj.title
    if tmp is not None:
        c['title'] = tmp
   
    numstyles=classobj.numstyles
    if numstyles>0:
        c['styles']=[]
        for i in range(0,numstyles):
            c['styles'].append(styleobj_to_dict(classobj.getStyle(i),mapobj))
    return c

def webobj_to_dict(webobj):
    meta = hashtableobj_to_dict(webobj.metadata)
    web = None
    if meta is not None:
        web = {}
        web['metadata']=meta
    return web

def hashtableobj_to_dict(hashobj):
    if hashobj.numitems == 0:
        return None
    meta={}
    key = hashobj.nextKey(None)
    while key is not None:
        meta[key]=hashobj.get(key)
        key = hashobj.nextKey(key)
    return meta
        

def labelobj_to_dict(labelobj,mapobj):
    if labelobj.size == -1:
        return None

    label = {}
    
    if labelobj.autoangle:
        label['angle']='auto'
    elif labelobj.autofollow:
        label['angle']='follow'
    else:
        if labelobj.angle != 0 and labelobj.angle != 360:
            label['angle']=labelobj.angle

    tmp = colorobj_to_dict(labelobj.backgroundcolor)
    if tmp is not None:
        label['backgroundcolor'] = tmp

    tmp = labelobj.buffer
    if tmp > 0:
        label['buffer']=tmp

    tmp = colorobj_to_dict(labelobj.color)
    if tmp is not None:
        label['color'] = tmp
    
    label['font']=labelobj.font
    
    if labelobj.force:
        label['force']=True
    
    tmp = labelobj.encoding
    if tmp is not None:
        label['encoding']=tmp

    tmp = labelobj.maxsize
    #if tmp != mapscript.MS_MAXFONTSIZE:
    if tmp != 256:
        label['maxsize']=labelobj.maxsize

    tmp = labelobj.minsize
    #if tmp != mapscript.MS_MINFONTSIZE:
    if tmp != 4:
        label['minsize']=labelobj.minsize

    tmp = labelobj.mindistance
    if tmp != -1:
        label['mindistance']=tmp

    if labelobj.autominfeaturesize:
        label['minfeaturesize']={'type':'auto'}
    else:
        tmp = labelobj.minfeaturesize
        if tmp != -1:
            label['minfeaturesize']={'type':'fixed','value':tmp}
 
    tmp = colorobj_to_dict(labelobj.outlinecolor)
    if tmp is not None:
        label['outlinecolor'] = tmp
  
    tmp = labelobj.position
    if tmp != mapscript.MS_CC:
        label['position'] = mapscriptutils.positions[labelobj.position]

    tmp = labelobj.priority
    if tmp != mapscript.MS_DEFAULT_LABEL_PRIORITY:
        label['priority'] = tmp

    label['size']=labelobj.size

    label['type'] = mapscriptutils.fonttypes[labelobj.type]

    return label

def styleobj_to_dict(styleobj,mapobj):
    style={}
    
    tmp = colorobj_to_dict(styleobj.backgroundcolor)
    if tmp is not None:
        style['backgroundcolor'] = tmp
 
    tmp = colorobj_to_dict(styleobj.color)
    if tmp is not None:
        style['color'] = tmp
    
    tmp = styleobj.maxsize
    #if tmp != mapscript.MS_MAXSYMBOLSIZE
    if tmp != 500:
        style['maxsize'] = tmp
    
    tmp = styleobj.maxwidth
    #if tmp != mapscript.MS_MAXSYMBOLWIDTH
    if tmp != 32:
        style['maxwidth'] = tmp
    
    tmp = styleobj.minsize
    #if tmp != mapscript.MS_MINSYMBOLSIZE
    if tmp != 1:
        style['minsize'] = tmp
    
    tmp = styleobj.minwidth
    #if tmp != mapscript.MS_MAXSYMBOLSIZE
    if tmp != 1:
        style['minwidth'] = tmp

    if (mapscriptutils.VERSION_MAJOR>5
            or (mapscriptutils.VERSION_MAJOR==5
            and mapscriptutils.VERSION_MINOR>=2)):
        style['opacity'] = styleobj.opacity
    
    tmp = colorobj_to_dict(styleobj.outlinecolor)
    if tmp is not None:
        style['outlinecolor'] = tmp
 
    tmp = styleobj.size
    if tmp != -1:
        style['size']=tmp
  
    tmp = styleobj.symbol
    if tmp > 0 and mapobj is not None:
        symbol = mapobj.symbolset.getSymbol(tmp)
        style['symbol'] = symbol.name
 
    tmp = styleobj.width
    if tmp != 1:
        style['width']=tmp

    tmp = styleobj.angle
    if tmp%360 != 0:
        style['angle']=tmp

    return style

def colorobj_to_dict(colorobj):
    if(colorobj.red >= 0):
        color = [colorobj.red,colorobj.green,colorobj.blue]
        return color
    else:
        return None

def rectobj_to_dict(rectobj):
    rect={}
    rect['minx']=rectobj.minx
    rect['miny']=rectobj.miny
    rect['maxx']=rectobj.maxx
    rect['maxy']=rectobj.maxy
    return rect

def dict_to_rectobj(rect):
    1+1

def update_webobj_from_dict(webobj,web):
    if 'metadata' in web:
        update_hashtableobj_from_dict(webobj.metadata,web['metadata'])
    return webobj

def update_hashtableobj_from_dict(hashobj,hash):
    for k, v in hash.iteritems():
        hashobj.set(k,v)

def update_colorobj_from_dict(colorobj,color):
    colorobj.red = color[0]
    colorobj.green = color[1]
    colorobj.blue = color[2]


def update_mapobj_from_dict(mapobj,map):
    if 'name' in map:
        mapobj.name = map['name']

    if 'extent' in map:
        e = map['extent']
        mapobj.setExtent(e['minx'],e['miny'],e['maxx'],e['maxy'])

    if 'projection' in map:
        mapobj.setProjection(map['projection'])
    
    if 'outputformats' in map:
        of = map['outputformats'][0]
        ofo = dict_to_outputformatobj(of)
        mapobj.appendOutputFormat(ofo)
        mapobj.selectOutputFormat(ofo.name)

    if 'imagetype' in map:
        mapobj.setImageType(map['imagetype'])

    if 'fontset' in map and map['fontset'] is not None:
        mapobj.setFontSet(map['fontset'])
    
    if 'web' in map:
        update_webobj_from_dict(mapobj.web, map['web'])
    
    if 'maxsize' in map:
        mapobj.maxsize = map['maxsize']

    if 'resolution' in map:
        mapobj.resolution = map['resolution']

    if 'symbolset' in map and map['symbolset'] is not None:
        mapobj.setSymbolSet(map['symbolset'])

    if 'units' in map:
        mapobj.units = mapscriptutils.units.lookup(map['units'])

    if 'height' in map and 'width' in map:
        mapobj.setSize(map['width'],map['height'])

    if 'imagecolor' in map:
        update_colorobj_from_dict(mapobj.imagecolor,map['imagecolor'])

    if 'layers' in map:
        for l in map['layers']:
            layerobj = mapscript.layerObj()
            update_layerobj_from_dict(layerobj,l,mapobj)
            mapobj.insertLayer(layerobj)

    return mapobj

def update_layerobj_from_dict(layerobj,layer,mapobj):
    
    if 'classitem' in layer:
        layerobj.classitem = layer['classitem']
 
    if 'connectiontype' in layer:
        ct = mapscriptutils.connectiontypes.lookup(layer['connectiontype'])
        if mapscriptutils.VERSION_MAJOR>5 or (mapscriptutils.VERSION_MAJOR==5 and mapscriptutils.VERSION_MINOR>=3):
            layerobj.setConnectionType(ct,"foo")
        else:
            layerobj.connectiontype = ct
    
    if 'connection' in layer:
        layerobj.connection = layer['connection']

    if 'data' in layer:
        layerobj.data = layer['data']
   
    if 'dump' in layer:
        if layer['dump']:
            layerobj.dump = mapscript.MS_TRUE

    if 'filter' in layer and 'item' in layer['filter'] and 'item' in layer['filter']:
        layerobj.filteritem = layer['filter']['item']
        layerobj.setFilter(layer['filter']['value'])

    if 'group' in layer:
        layerobj.group = layer['group']
  
    if 'labelcache' in layer:
        if not layer['labelcache']:
            layerobj.labelcache = mapscript.MS_OFF

    if 'labelitem' in layer:
        layerobj.labelitem = layer['labelitem']

    if 'labelmaxscaledenom' in layer:
        layerobj.labelmaxscaledenom = layer['labelmaxscaledenom']

    if 'labelminscaledenom' in layer:
        layerobj.labelminscaledenom = layer['labelminscaledenom']

    if 'maxscaledenom' in layer:
        layerobj.maxscaledenom = layer['maxscaledenom']

    if 'metadata' in layer:
        update_hashtableobj_from_dict(layerobj.metadata,layer['metadata'])
   
    if 'minscaledenom' in layer:
        layerobj.minscaledenom = layer['minscaledenom'] 
    
    if 'name' in layer:
        layerobj.name = layer['name']
 
    if 'offsite' in layer:
        update_colorobj_from_dict(layerobj.offsite,layer['offsite'])

    if 'opacity' in layer:
        layerobj.opacity = layer['opacity']

    if 'postlabelcache' in layer:
        if layer['postlabelcache']:
            layerobj.postlabelcache = mapscript.MS_TRUE

    if 'projection' in layer:
        layerobj.setProjection(layer['projection'])

    if 'sizeunits' in layer:
        layerobj.sizeunits = mapscriptutils.units.lookup(layer['sizeunits'])

    if 'status' in layer :
        layerobj.status = mapscriptutils.status.lookup(layer['status'])

    if 'symbolscaledenom' in layer:
        layerobj.symbolscaledenom = layer['symbolscaledenom']

    if 'template' in layer:
        layerobj.template = layer['template']
    
    if 'tileindex' in layer:
        layerobj.tileindex = layer['tileindex']
        if 'tileitem' in layer:
            layerobj.tileitem = layer['tileitem']
    
    if 'type' in layer:
        layerobj.type = mapscriptutils.layertypes.lookup(layer['type'])

    if 'units' in layer:
        layerobj.units = mapscriptutils.units.lookup(layer['units'])
 
    if 'classes' in layer:
        for c in layer['classes']:
            classobj = mapscript.classObj()
            update_classobj_from_dict(classobj,c,mapobj)
            layerobj.insertClass(classobj)

    return layerobj


def update_classobj_from_dict(classobj,c,mapobj):
    if 'expression' in c:
        classobj.setExpression(c['expression'].encode('utf8'))   
    
    if 'label' in c:
        update_labelobj_from_dict(classobj.label,c['label'],mapobj)

    if 'maxscaledenom' in c:
        classobj.maxscaledenom = c['maxscaledenom']

    if 'minscaledenom' in c:
        classobj.minscaledenom = c['minscaledenom'] 

    if 'name' in c:
        classobj.name = c['name'].encode('utf8')

    if 'text' in c:
        classobj.setText(c['text'])

    if 'title' in c:
        classobj.title = c['title']

    if 'styles' in c:
        for style in c['styles']:
            styleobj = mapscript.styleObj()
            update_styleobj_from_dict(styleobj,style,mapobj)
            classobj.insertStyle(styleobj)
    
    return classobj

def update_labelobj_from_dict(labelobj,label,mapobj):
    if 'angle' in label:
        if label['angle'] == 'auto':
            labelobj.autoangle = mapscript.MS_TRUE
        elif label['angle'] == 'follow':
            labelobj.autofollow = mapscript.MS_TRUE
        else:
            labelobj.angle = label['angle']
    
    if 'backgroundcolor' in label:
        update_colorobj_from_dict(labelobj.backgroundcolor,label['backgroundcolor'])
    
    if 'buffer' in label:
        labelobj.buffer = label['buffer']

    if 'color' in label:
        update_colorobj_from_dict(labelobj.color,label['color'])
    
    if 'font' in label:
        labelobj.font = label['font']

    if 'force' in label and label['force']:
        labelobj.force = mapscript.MS_TRUE

    if 'encoding' in label:
        labelobj.encoding = label['encoding']

    if 'maxsize' in label:
        labelobj.maxsize = label['maxsize']

    if 'minsize' in label:
        labelobj.minsize = label['minsize']

    if 'mindistance' in label:
        labelobj.mindistance = label['mindistance']

    if 'minfeaturesize' in label:
        if label['minfeaturesize']['type'] == 'auto':
            labelobj.autominfeaturesize = mapscript.MS_TRUE
        else:
            labelobj.minfeaturesize = label['minfeaturesize']['value']

    if 'outlinecolor' in label:
        update_colorobj_from_dict(labelobj.outlinecolor,label['outlinecolor'])
    
    if 'position' in label:
        labelobj.position = mapscriptutils.positions.lookup(label['position'])

    if 'priority' in label:
        labelobj.priority = label['priority']

    if 'size' in label:
        labelobj.size = label['size']

    if 'type' in label:
        labelobj.type = mapscriptutils.fonttypes.lookup(label['type'])
    

def update_styleobj_from_dict(styleobj,style,mapobj):
    if 'backgroundcolor' in style:
        update_colorobj_from_dict(styleobj.backgroundcolor,style['backgroundcolor'])
    
    if 'color' in style:
        update_colorobj_from_dict(styleobj.color,style['color'])
    
    if 'outlinecolor' in style:
        update_colorobj_from_dict(styleobj.outlinecolor,style['outlinecolor'])
      
    if 'minsize' in style:
        styleobj.minsize = style['minsize']

    if 'minwidth' in style:
        styleobj.minwidth = style['minwidth']
    
    if 'maxsize' in style:
        styleobj.maxsize = style['maxsize']

    if 'maxwidth' in style:
        styleobj.maxwidth = style['maxwidth']
     
    if 'opacity' in style:
        if (mapscriptutils.VERSION_MAJOR>5
                or (mapscriptutils.VERSION_MAJOR==5
                and mapscriptutils.VERSION_MINOR>=2)):
            styleobj.opacity = style['opacity']
    
    if 'size' in style:
        styleobj.size = style['size']

    if 'symbol' in style:
        symbol = str(style['symbol'])
        if type(symbol) is not StringType:
            styleobj.symbol = style['symbol']
        else:
            styleobj.setSymbolByName(mapobj,symbol)

    if 'width' in style:
        styleobj.width = style['width']

    if 'angle' in style:
        styleobj.angle = style['angle']
