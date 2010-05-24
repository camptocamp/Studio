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

# in ogrgdal 1.6 and higher the ogr module is in the osgeo module
try:
    from osgeo import ogr
    from osgeo import osr
    from osgeo import gdal
except ImportError:
    import ogr
    import osr
    import gdal


try:
    from hashlib import md5
except ImportError:
    from md5 import new as md5

import mapscript
import mapserializer
import re
import os
from studio.lib.colorthemer import ColorRamp, QualitativePalette

def _nice_float(float):
    """ Returns a float converted as string, but don't put all those useless
    0s at the end"""
    return re.sub('\.0$', '', str(float))

def discover_datasources(datastore_str):
    """ Discover the datasources contained in the datastore
    corresponding to the OGR string ogr_str, return an
    array of {name,type, hash}"""
    
    datastore = DataStore(datastore_str)
    datasources=[]
    for ds in datastore.get_datasources():
        datasources.append({'text':ds.name, 'type':ds.type, 'id':ds.getHash(), 'leaf': True})
    return datasources

def discover_datasource_columns(datastore_str, datasource_id):
    """ Loop through the datastore's datasources to find
    the datasource identified by datasource_id, return
    the matching datasource's columns. """
    datastore = DataStore(datastore_str)
    datasource = datastore.get_datasource(datasource_id)
    if datasource.type != "RASTER":
        return datasource.list_columns()
    else:
        return []

def get_mapfile(ogr_str,datasource_id,classification=None):
    datastore = DataStore(ogr_str)
    datasource = datastore.get_datasource(datasource_id)
    return datasource.get_mapfile(classification)

def decode_string(s):
    try:
        return s.decode('utf8')
    except UnicodeDecodeError:
        return s.decode('latin').encode('utf8')


class DataStore:
    def __init__(self, datastore_str):
        self.datastore_str = datastore_str

        try:
            self.ogr_connection = ogr.Open(str(self.datastore_str))
        except ogr.OGRError:
            self.ogr_connection = None

        if self.ogr_connection is not None:
            conn_type = self.ogr_connection.GetDriver().GetName()
            if conn_type == "ESRI Shapefile":
                self.connection_type = "directory"
            elif conn_type == "PostgreSQL":
                self.connection_type = "postgis"
            else:
                # only shapefiles and postgis are
                # currently supported
                self.ogr_connection = None

        # if no ogr datasources were found, check if it is a directory
        if self.ogr_connection is None:
            if os.path.exists(self.datastore_str):
                self.connection_type = "directory"
            else:
                raise RuntimeError("failed to open datastore (%s)" % (datastore_str))

    def get_sqlalchemy_url(self):
        if self.ogr_connection.GetDriver().GetName() != 'PostgreSQL':
            raise RuntimeError("must be a postgis connection (%s)" % (datastore_str))
        host = re.sub(r'^.*host=([^ ]+).*$', r'\1', self.datastore_str)
        user = re.sub(r'^.*user=([^ ]+).*$', r'\1', self.datastore_str)
        password = re.sub(r'^.*password=([^ ]+).*$', r'\1', self.datastore_str)
        dbname = re.sub(r'^.*dbname=([^ ]+).*$', r'\1', self.datastore_str)   
        return "postgres://%s:%s@%s/%s"%(user, password, host, dbname)

    def _is_valid_raster_suffix(self,suffix):
        allowed_suffixes = ['jpg','jpeg','tif','tiff','ecw','png','sid','xml']
        suf = suffix.lower()
        return suf in allowed_suffixes

    def get_raster_datasources(self):
        datasources = []
        if os.path.exists(self.datastore_str):
            dirList=os.listdir(self.datastore_str)
            for file in dirList:
                (fileBaseName, fileExtension)=os.path.splitext(file)
                if not self._is_valid_raster_suffix(fileExtension[1:]):
                    continue
                file = os.path.join(self.datastore_str,file)
                gdal_src = gdal.Open(str(file))
                if gdal_src is not None:
                    datasources.append(GdalDataSource(gdal_src,self))
        return datasources

    def get_vector_datasources(self):
        datasources = []
        if self.ogr_connection is not None:
            for layer in self.ogr_connection:
                try:
                    ds = OgrDataSource(layer,self)
                    datasources.append(ds)
                except RuntimeError:
                    #silently ignore unsupported layer types
                    pass
        return datasources

    def get_datasources(self):
        datasources = []
        datasources.extend(self.get_vector_datasources())
        datasources.extend(self.get_raster_datasources())
        return datasources
        

    def get_datasource(self,datasource_id):
        datasources = []
        datasource = None
        if self.ogr_connection is not None:
            datasources.extend(self.get_vector_datasources())

        if self.connection_type == "directory":
            datasources.extend(self.get_raster_datasources())
        
        for ds in datasources:
            if ds.getHash() == datasource_id:
                datasource = ds
                break

        if datasource is None:
            raise RuntimeError("no datasource with id (%s)" %(datasource_id))
        return datasource

class DataSource:
    def __init__(self):
        self.name = None
        self.type = None
        self.datastore = None

    def getHash(self):
        return md5(self.name).hexdigest()

class GdalDataSource(DataSource):
    def __init__(self, gdal_source, datastore):
        self.type = 'RASTER'
        self.gdal_source = gdal_source
        self.datastore = datastore
        self.name = os.path.basename(self.gdal_source.GetDescription())
    
    def get_mapfile(self,classification = None):
        layerobj = mapscript.layerObj()
        layerobj.status = mapscript.MS_ON
        layerobj.type = mapscript.MS_LAYER_RASTER
        layerobj.name = self.name
        layerobj.data = self.gdal_source.GetDescription()
        projection = self.get_proj4()
        if projection is not None:
            layerobj.setProjection(projection)
        return mapserializer.layerobj_to_dict(layerobj,None)

    def get_proj4(self):
        p = osr.SpatialReference()
        p.ImportFromWkt(self.gdal_source.GetProjection())
        return p.ExportToProj4()


class OgrDataSource(DataSource):
    def __init__(self,ogr_layer,datastore):
        """OGR layer wrapper. the datastore argument is required as we need a reference
        to the datastore to be able to build the mapfile excerpt"""
        self.ogr_layer = ogr_layer
        self.datastore = datastore
        layer_type = self.ogr_layer.GetLayerDefn().GetGeomType()
        if layer_type in [ogr.wkbLineString, ogr.wkbMultiLineString]:
            self.type = 'LINE'
        elif layer_type in [ogr.wkbMultiPoint, ogr.wkbPoint]:
            self.type = 'POINT'
        elif layer_type in [ogr.wkbMultiPolygon, ogr.wkbPolygon]:
            self.type = 'POLYGON'
        else:
            raise RuntimeError("unsupported layer type")
        self.name = self.ogr_layer.GetName()

    def list_columns(self):
        columns = []
        defn = self.ogr_layer.GetLayerDefn()
        for i in range(0,defn.GetFieldCount()):
            field = defn.GetFieldDefn(i)
            columns.append({'name':field.GetName(),'type':self._get_column_type(field)})
        return columns

    def _get_column(self,name):
        columns = self.list_columns()
        for column in columns:
            if column['name']==name:
                return column
        return None

    def _get_featureId_column(self):
        cname = None
        if hasattr(self.ogr_layer, 'GetFIDColumn'):
            cname = self.ogr_layer.GetFIDColumn()
        if cname is None or cname == '':
            if self.datastore.connection_type == "postgis":
                #open a new connection to the datasource
                conn = ogr.Open(self.datastore.datastore_str)
                cols = conn.ExecuteSQL("""SELECT attname::text
                        FROM pg_attribute
                        JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
                        JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
                        LEFT JOIN pg_constraint ON conrelid = pg_class.oid AND pg_constraint.contype = 'p'
                        WHERE pg_class.relname = '%s' AND pg_attribute.attnum = ANY (pg_constraint.conkey)"""%self.ogr_layer.GetName())
                
                #pick the first column 
                if cols.GetFeatureCount() > 0:
                    cname = cols.GetFeature(0).GetFieldAsString(0)
            
            # if we still haven't found a column, we resort to looping through the
            # column names to find one with a sufficiently convenient name.
            # is this really needed?
            if cname is None or cname=='':
                defn = self.ogr_layer.GetLayerDefn()
                for i in range(0,defn.GetFieldCount()):
                    fieldname = defn.GetFieldDefn(i).GetName()
                    if fieldname.upper().endswith('ID'):
                        cname = fieldname
                        break
        return cname

    def _get_column_type(self,column):
        """ Return 'numeric' if the column is of type integer or
        real, otherwise return 'string'. """
        ctype = column.GetType()
        if ctype in [ogr.OFTInteger, ogr.OFTReal]:
            return 'numeric'
        else:
            return 'string'
    
    def get_mapfile(self, classification = None):
        """ Get a representation of the default MapFile LAYER block. """
        if classification is None:
            return self._get_default_mapfile_excerpt()
        else:
            return self._get_classified_mapfile(classification)        
    
    def _get_default_mapfile_excerpt(self):
        """ Given an OGR string, an OGR connection and an OGR layer, create and
        return a representation of a MapFile LAYER block. """
            
        layerobj = self._get_layer_stub()
        classobj = mapscript.classObj() 
        layerobj.insertClass(classobj)
        styleobj = self._get_default_style()
        classobj.insertStyle(styleobj)
        
        return mapserializer.layerobj_to_dict(layerobj,None)
    
    def _get_classified_mapfile(self,classification):
        if classification['type']=="quantile":
            return self._get_quantile_mapfile(classification)
        elif classification['type']=="unique":
            return self._get_unique_mapfile(classification)
    
    def _get_layer_stub(self):
        """ builds a minimal mapscript layerobj, with no styling """
        layerobj = mapscript.layerObj()
        layerobj.name = self.name
        layerobj.status = mapscript.MS_ON
        projection = self.ogr_layer.GetSpatialRef()
        featureIdColumn = self._get_featureId_column()
        if featureIdColumn is not None and featureIdColumn != '' :
            layerobj.metadata.set('gml_featureid', featureIdColumn)
        if projection is not None:
            layerobj.setProjection(projection.ExportToProj4())
        if self.datastore.connection_type == "directory":
            #append the extension to the shapefile until mapserver bug 2895 is fixed
            datastr = os.path.normpath(self.datastore.datastore_str + "/" + self.name)
            if os.path.exists(datastr+'.shp'):
                datastr = datastr+'.shp'
            elif os.path.exists(datastr+'.SHP'):
                datastr = datastr+'.SHP'
            layerobj.data = datastr
        elif self.datastore.connection_type == "postgis":
            layerobj.connectiontype = mapscript.MS_POSTGIS
            #remove the leading "PG:" from the connection string
            layerobj.connection = self.datastore.datastore_str[3:].strip()
            if featureIdColumn is not None and featureIdColumn != '' :
                layerobj.data = "%s from %s using unique %s" %(
                    self.ogr_layer.GetGeometryColumn(),
                    self.name,
                    featureIdColumn)
            else:
                layerobj.data = "%s from %s"%(self.ogr_layer.GetGeometryColumn(),self.name)
        else:
            raise RuntimeError("unsupported connection type")
        if self.type == 'POINT':
            layerobj.type = mapscript.MS_LAYER_POINT
        elif self.type == 'POLYGON':
            layerobj.type = mapscript.MS_LAYER_POLYGON
        else:
            layerobj.type = mapscript.MS_LAYER_LINE
        return layerobj 
   
    def _get_default_style(self):
        styleobj = mapscript.styleObj()
        if self.type == 'POINT':
            styleobj.size = 5
            styleobj.color.setHex('#ff0000')
        elif self.type == 'POLYGON':
            styleobj.color.setHex('#ffff00')
        else:
            styleobj.color.setHex('#0000ff')
            styleobj.width=3
        return styleobj

    def _get_unique_mapfile(self,classification):
        layerobj = self._get_layer_stub()
        attribute = classification['attribute']
        column = self._get_column(attribute)
        if column is None:
            raise ValueError("column %s not found in datasource %s"%(attribute,self.name))
        values = self.get_distinct_values(attribute)
        layerobj.classitem = attribute
        theme = self._get_theme(classification, len(values))
        for value in values:
            color = theme.pop(0)
            classobj = mapscript.classObj() 
            layerobj.insertClass(classobj)
            styleobj = self._get_default_style()
            styleobj.color.setRGB(color[0],color[1],color[2])
            classobj.insertStyle(styleobj)
            if column['type'] == 'numeric':
                classobj.name = '%s'%(value)
                classobj.setExpression('([%s]==%s)'%(attribute,value))
            else:
                classobj.name = '%s'%(value)
                classobj.setExpression('("[%s]"=="%s")'%(attribute.encode('utf8'),value))

        return mapserializer.layerobj_to_dict(layerobj,None)


    def _get_quantile_mapfile(self,classification):
        layerobj = self._get_layer_stub()
        intervals = int(classification['intervals'])
        attribute = classification['attribute']
        bounds = self._get_classification_bounds(attribute, intervals)
        theme = self._get_theme(classification, len(bounds)+1)
        for i in range(0, len(bounds)+1):
            color = theme[i]
            classobj = mapscript.classObj() 
            layerobj.insertClass(classobj)
            if i<len(bounds):
                classobj.setExpression('([%s]<%s)'%(attribute, _nice_float(bounds[i])))
                classobj.name = '%s < %s'%(attribute, _nice_float(bounds[i]))
            else:
                classobj.name = '%s >= %s'%(attribute, _nice_float(bounds[i-1]))
            styleobj = mapscript.styleObj()
            styleobj.color.setRGB(color[0],color[1],color[2])
            classobj.insertStyle(styleobj)
        return mapserializer.layerobj_to_dict(layerobj,None)

    def _get_theme(self, classification, intervals):
        palette = classification['palette']
        type = palette['type']
        if type == "ramp":
            color1 = [241,238,246]
            color2 = [4,90,141]
            interpolation = "RGB"
            if 'startcolor' in palette:
                color1 = palette['startcolor']
            if 'endcolor' in palette:
                color2 = palette['endcolor']
            if 'interpolation' in palette:
                interpolation = palette['interpolation']
            return ColorRamp(intervals,color1,color2,interpolation).get_palette()
        elif type == "qualitative":
            theme = 0
            if 'theme' in palette:
                theme = palette['theme']
            return QualitativePalette(intervals,theme).get_palette()
    
    def get_distinct_values(self,attribute):
        columns = self.list_columns()
        found = False
        index = None
        for i in range(0,len(columns)):
            if columns[i]['name']==attribute:
                found = True
                index = i
                break
        if not found:
            raise ValueError("column (%s) not found in datasource"%(attribute))
        values = set()
        self.ogr_layer.ResetReading()
        feature = self.ogr_layer.GetNextFeature()
        while feature is not None:
            value = decode_string(feature.GetFieldAsString(index))
            values.add(value)
            feature = self.ogr_layer.GetNextFeature()
        return values

    def _get_classification_bounds(self, attribute, intervals):
        columns = self.list_columns()
        found = False
        index = None
        for i in range(0, len(columns)):
            if columns[i]['name']==attribute:
                found = True
                index = i
                break
        if not found:
            raise ValueError("column (%s) not found in datasource"%(attribute))
        if columns[index]['type']!='numeric':
            raise ValueError("""column (%s) cannot be used for quantile classification
            as it is not numeric"""%(attribute))
        self.ogr_layer.ResetReading()

        feature = self.ogr_layer.GetNextFeature()
        values = []
        while feature is not None:
            values.append(feature.GetFieldAsDouble(index))
            feature.Destroy()
            feature = self.ogr_layer.GetNextFeature()
        values.sort()

        bounds=[]
        interval_size = int(1.0*self.ogr_layer.GetFeatureCount()/intervals + 0.5)
        prev_value=values[0]
        pos=0
        for i in range(1, intervals):
            pos += interval_size
            cur_value=values[pos]
            while cur_value<=prev_value:
                #need to adjust a bit since we've got the same value as the previous boundary
                pos+=1
                if pos >= len(values):
                    return bounds
                cur_value=values[pos]
            prev_value=cur_value   
            bounds.append(cur_value)
            interval_size = int(1.0*(self.ogr_layer.GetFeatureCount()-pos)/(intervals-i) + 0.5)
            
        return bounds
