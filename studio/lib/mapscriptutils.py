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

class msConstants(dict):
    
    def __init__(self,items):
        """create class using supplied dictionary"""
        dict.__init__(self, items)

    def lookup(self,value):
        """ return the first key in dict where value is name """
        for k,v in self.iteritems():
            if value == v:
                return k
        return None

VERSION_MAJOR = None
VERSION_MINOR = None
VERSION_REV = None


try:
    #MS_VERSION_MAJOR was defined in 5.2
    VERSION_MAJOR = mapscript.MS_VERSION_MAJOR
    VERSION_MINOR = mapscript.MS_VERSION_MINOR
    VERSION_REV = mapscript.MS_VERSION_REV
except AttributeError:
    version = mapscript.MS_VERSION.split('.')
    VERSION_MAJOR = int(version[0])
    if len(version)>2:
        VERSION_MINOR = int(version[1])
        VERSION_REV = int(version[2])
    else:
        VERSION_MINOR = int(version[1][0])
        VERSION_REV='dev'
    
SUPPORTS_AGG = "SUPPORTS=AGG " in mapscript.msGetVersion()


status = msConstants({
        mapscript.MS_ON:"on",
        mapscript.MS_OFF:"off",
        mapscript.MS_DEFAULT:"default",
    })

fonttypes = msConstants({
        mapscript.MS_TRUETYPE:"truetype",
        mapscript.MS_BITMAP:"bitmap"
    })

imagemodes = msConstants({
        mapscript.MS_IMAGEMODE_RGB:"rgb",
        mapscript.MS_IMAGEMODE_RGBA:"rgba",
        mapscript.MS_IMAGEMODE_PC256:"pc256"
    })

units = msConstants({ 
        mapscript.MS_DD:"dd",
        mapscript.MS_PIXELS:"pixels",
        mapscript.MS_METERS:"meters",
        mapscript.MS_MILES:"miles",
        mapscript.MS_INCHES:"inches",
        mapscript.MS_KILOMETERS:"kilometers",
        mapscript.MS_FEET:"feet"
    })

positions = msConstants({
        mapscript.MS_UL:"ul",
        mapscript.MS_UC:"uc",
        mapscript.MS_UR:"ur",
        mapscript.MS_CL:"cl",
        mapscript.MS_CC:"cc",
        mapscript.MS_CR:"cr",
        mapscript.MS_LL:"ll",
        mapscript.MS_LC:"lc",
        mapscript.MS_LR:"lr",
        mapscript.MS_AUTO:"auto"
    })

connectiontypes = msConstants({
        mapscript.MS_SDE:"sde",
        mapscript.MS_OGR:"ogr",
        mapscript.MS_POSTGIS:"postgis",
        mapscript.MS_WMS:"wms",
        mapscript.MS_ORACLESPATIAL:"oraclespatial",
        mapscript.MS_WFS:"wfs",
        mapscript.MS_PLUGIN:"plugin"
    })

layertypes = msConstants({
        mapscript.MS_LAYER_POLYGON:"polygon",
        mapscript.MS_LAYER_POINT:"point",
        mapscript.MS_LAYER_LINE:"line",
        mapscript.MS_LAYER_ANNOTATION:"annotation",
        mapscript.MS_LAYER_RASTER:"raster",
        mapscript.MS_LAYER_CIRCLE:"circle"
    })
