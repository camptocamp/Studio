/*
 * Copyright (C) 2010  Camptocamp
 *
 * This file is part of Studio
 *
 * Studio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Studio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Studio.  If not, see <http://www.gnu.org/licenses/>.
 */

OpenLayers.Util.extend(OpenLayers.Lang.en, {

	'Cancel': "Cancel",
	'Apply': "Apply",
	'Name': "Name",
	'Projection': "Projection",
	'Units': "Units",
	'Resolution': "Resolution",
    'Scales': 'Scales',
    'dpi': 'DPI',
	'Height': "Height",
	'Width': "Width",
	'Attention': "Warning !",
	'Saving ...': "Saving...",
	'Comment': "Comment",
	'not specified': "Not specified",
	'Color': "Color",
	'Symbol': "Symbol",
	'Symbol size': "Symbol size",
	'Angle': "Angle",
	'Priority': "Priority",
	'Position': "Position",
	'Column': "Column",
	'Value': "Value",
	'Manage datastore': "Data",
	'Manage mapfiles': "Mapfile",
	'Alias': "Alias",
	'Editable': "Editable",
	'Tooltip': "Tooltip",
	'Search': "Search",
	'add': "Add",
	'Error': 'Error',
	'Status code': "Status code",

	// widgets/Chooser.js
	'createnewmapfile': "Create new mapfile ...",
	'createnewMapFish': "Create new MapFish ...",
    'createnewdatastore': "Create new data store ...",
	'exportmapfile': "Export mapfile",
	'exportMapFish': "Export MapFish",
	'deletemapfile': "Delete mapfile",
	'delete datastore': "Delete datastore",
	'deleteMapFish': "Delete MapFish",
    'editmapfile': "Edit mapfile",
    'editdatastore': "Edit datastore",
    'editMapFish': "Edit MapFish",
	'DefaultName': "Default",
	'discardmapfile': "Delete mapfile",
	'discardMapFish': "Delete MapFish",
	'Are you sure you want to discard this mapfile ?': "Do you really want to delete this mapfile ?",
	'Are you sure you want to discard this MapFish ?': "Do you really want to delete this MapFish ?",

    // MapfileMgr/AddLayerWindow.js
    'Add a LAYER': "Add a layer",
    'From a datasource': "From a datasource",
    'Data store': "Data store",
    'Data source': "Data source",
    'Choose one source': "Choose one source",
    'Using an existing template': "From an existing template",
    'Layer template': "Layer template",
    'Choose one template': "Choose one template",

    // widgets/DatastoreCombo.js
    'Choose one store': "Choose one data store",
    'DataStore': "Data store",

    // MapfileMgr/ClassificationWizard.js
    'Unique values': "Unique values",
    'Quantiles': "Quantiles",
    'Classification Wizard': "Classification wizard",
    'Choose attribute': "Choose attribute",
    'Choose method': "Choose method",
    'Select a method...': "Select a method",
    'First color': "First color",
    'Last color': "Last color",
    'Choose interpolation': "Choose interpolation",
    'Choose a predefined palette': "Choose a predefined palette",
    'Classify': "Classify",
    'Number of classes': "Number of classes",
    "Classification didn't succed, probably due to a timeout. Status text: ": "Classification didn't succed, probably due to a timeout. Status text: ",

    // MapfileMgr/LayerPropertiesPanel.js
    'LAYER object properties': "LAYER object properties",
    'Opacity': "Opacity",
    'Limit by scale': "Limit by scale",
    'WFS attributes': "WFS attributes",
    'Check the attributes you would want to see in a GetFeature WFS request response.': "Check the attributes you would want to see in a GetFeature WFS request response.",
    'Save mapfile': "Save mapfile",
    'Map Viewer': "Map Viewer",
    'Save mapfile and refresh map': "Save mapfile and refresh map",
    'Show a bigger map': "Show a bigger map",
    'Show a smaller map': "Show a smaller map",
    'Display selected layer': "Display selected layer",
    'Save as layer template': "Save as layer template",
    'classify using wizard': "Classify using wizard",
    'delete layer': "Delete layer",
    'move up class': "Move up this class",
    'move down class': "Move down this class",
    'delete class': "Delete class",
    'create new layer ...': "Create new layer ...",
    'global properties': "Global properties",
    'layers': "Layers",
    'create new class ...': "Create new class ...",
    'New class': "New class",
    'Label item': "Label",

    // MapfileMgr/MapPropertiesPanel.js
    'MAP object properties': "MAP object properties",
    'Maxsize': "Maxsize",
    'Image color': "Image color",
    'extent': "Extent",

    // MapfileMgr/Panel.js
    '<-- Back to mapfiles list': "<-- Back to mapfiles list",
    'There are unsaved changes !<br /> Are you sure you want to switch to another mapfile ?<br /> ': "There are unsaved changes !<br /> Are you sure you want to switch to another mapfile ?<br /> ",
    'Delete confirmation': "Delete confirmation",
    'Are you sure that you want to delete this layer ?': "Are you sure that you want to delete this layer ? To see the modification in the map, please save the mapfile. ",
    'add a style to all classes': 'update styles globally',

    // DataMgr/Panel.js
    'Parameters': "Properties",
    'Add a new datasource ...': "Add a new datasource ...",
    '<-- Back to datastores list': "<-- Back to datastores list",

    // MapfileMgr/SaveLayertemplateWindow.js
    'Save as layertemplate': "Save as layertemplate",

    // MapfileMgr/Styler/ClassPropertiesPanel.js
    'CLASS object properties': "CLASS object properties",
    'Add Stroke': "Add Stroke",
    'Add a Stroke style': "Add a Stroke style",
    'Add Fill': "Add Fill",
    'Add a Fill style': "Add a Fill style",
    'Add Point': "Add Point",
    'Add a Point style': "Add a Point style",
    'Limit by condition': "Limit by condition",
    'Labels': "Labels",

    // MapfileMgr/Styler/FillStylePanel.js
    'Fill style': "Fill style",

    // MapfileMgr/Styler/LabelStylePanel.js
    'auto': "Automatic",
    'follow': "Follow",
    'Font': "Font",
    'Size': "Size",
    'Buffer': "Buffer",
    'Outline color': "Outline color",
    "Don't forget to set a value for labelitem at the layer level": "Don't forget to set a value for labelitem at the layer level",

    // MapfileMgr/Styler/LimitByConditionPanel.js
    'Operator': "Operator",

    // MapfileMgr/Chooser.js
    'labelmapfile': "mapfile",
    'labelmapfiles': "mapfiles",

    // MapfileMgr/Styler/LimitByScalePanel.js
    'Min scale': "Min scale",
    'Get from map': "Get from map",
    'Max scale': "Max scale",
    "Must be bigger than Min Scale (": "Must be bigger than Min Scale (",

    // MapfileMgr/Styler/PositionComboBox.js
    'upper left': "upper left",
    'upper center': "upper center",
    'upper right': "upper right",
    'center left': "center left",
    'center center': "middle",
    'center right': "center right",
    'lower left': "lower left",
    'lower center': "lower center",
    'lower right': "lower right",

     // MapfileMgr/Styler/StrokeStylePanel.js
     'Stroke style': "Stroke style",

     // MapfileMgr/Styler/WfsAttributesPanel.js
     'Alias (click to edit)': "Alias (click to edit)",

     // DataMgr/AddDatasourceWindow.js
     'Add a datasource': "Add a datasource",
     'datasource': "Datasource",
     'Uploading file...': "Uploading file...",

    //MapfileMgr/BboxPanel.js
    'MaxValueBiggerThanMin': 'The max value must be bigger than the min value',

    //MapFileMgr/StyleWizard.js
    'Style Wizard': 'Update style',
    'Update mode: ': 'Update mode: ',
    'Select an update mode': 'Select an update mode',
    'Update existing classes': 'Update existing classes',
    'Add new classes': 'Add new classes'
});
