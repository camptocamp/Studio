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

import colorsys
import random

class ColorThemer(object):
    def get_palette(self):
        pass

class ColorRamp(ColorThemer):
    def __init__(self,intervals,startcolor, endcolor, interpolationtype = "RGB"):
        self.startcolor = [ component / 255.0 for component in startcolor ]
        self.endcolor = [ component / 255.0 for component in endcolor ]
        if intervals < 2:
            raise ValueError("must specify at least 2 intervals")
        self.intervals = intervals
        self.interpolationtype = interpolationtype

    
    def get_palette(self):
        c1 = None
        c2 = None
        if self.interpolationtype == "RGB":
            c1 = list(self.startcolor)
            c2 = list(self.endcolor)
        elif self.interpolationtype == "HSV":
            c1 = colorsys.rgb_to_hsv(self.startcolor[0],self.startcolor[1],self.startcolor[2])
            c2 = colorsys.rgb_to_hsv(self.endcolor[0],self.endcolor[1],self.endcolor[2])
        
        palette = []
        for i in range(0,self.intervals):
            palette.append(self._interpolate(c1,c2,i,self.intervals))

        if self.interpolationtype == "HSV":
            for i in range(0,self.intervals):
                palette[i] = colorsys.hsv_to_rgb(palette[i][0],palette[i][1],palette[i][2])
        
        for i in range(0,self.intervals):
            palette[i] = [ int(round(component * 255)) for component in palette[i] ]

        return palette




    def _interpolate(self,color1,color2,index,total):
        ret=[]
        for component in range(len(color1)):
            comprange = color2[component]-color1[component]
            step = comprange / (total-1)
            ret.append(color1[component] + index * step)
        return ret
    
class QualitativePalette(ColorThemer):
    def __init__(self,intervals,palette_index=0):
        self.palettes = [
            [[141,211,199],[255,255,179],[190,186,218],[251,128,114],[128,177,211],[253,180,98],
                [179,222,105],[252,205,229],[217,217,217],[188,128,189],[204,235,197],[255,237,111]],
         
            [[166,206,227],[31,120,180],[178,223,138],[51,160,44],[251,154,153],[227,26,28],
                [253,191,111],[255,127,0],[202,178,214],[106,61,154],[255,255,153]],
     
            [[251,180,174],[179,205,227],[204,235,197],[222,203,228],[254,217,166],[255,255,204],
                [229,216,189],[253,218,236],[242,242,242]],
        
            [[228,26,28],[55,126,184],[77,175,74],[152,78,163],[255,127,0],[255,255,51],[166,86,40],
                [247,129,191],[153,153,153]],
              
            [[179,226,205],[253,205,172],[203,213,232],[244,202,228],[230,245,201],[255,242,174],
                [241,226,204],[204,204,204]],
        
            [[102,194,165],[252,194,165],[141,160,203],[231,138,195],[166,216,84],[255,217,47],
                [229,196,148],[179,179,179]],
        
            [[27,158,119],[217,95,2],[117,112,179],[231,41,138],[102,166,30],[230,171,2],
                [166,118,29],[102,102,102]],
        
            [[127,201,127],[190,174,212],[253,192,134],[255,255,153],[56,108,176],[240,2,127],
                [191,91,23],[102,102,102]]]
        self.intervals = intervals
        if palette_index<0 or palette_index>=len(self.palettes):
            raise ValueError("palette index  must be between 0 and %d"%(len(self.palettes)))
        self.palette_index = palette_index

    def get_palette(self):
        curpalette = self.palettes[self.palette_index]
        curpalettelen = len(curpalette)
        ret = []

        for i in range(0,self.intervals):
            if i < curpalettelen:
                ret.append(curpalette[i])
            else:
                ret.append(self.get_random_color())
        return ret

    def get_random_color(self):
        return [random.randint(0,255),random.randint(0,255),random.randint(0,255)]

        

