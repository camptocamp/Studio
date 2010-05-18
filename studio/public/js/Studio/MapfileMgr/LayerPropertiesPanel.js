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

Ext.namespace('Studio', 'Studio.MapfileMgr');

Studio.MapfileMgr.LayerPropertiesPanel = Ext.extend(Studio.MapfileMgr.MapfileForm, {

    title: OpenLayers.i18n('LAYER object properties'),
    autoScroll: true,

    /**
     * APIProperty: map
     * {OpenLayers.Map} the map
     */
    map: null,

    // useless information for end user
    //datasourceTpl: new Ext.XTemplate(
        ////TODO: put something more "humane" here
        //'<p><b>Data store :</b> {datastoreid}</p><br />',
        //'<p><b>Data source :</b> {datasourceid}</p>'),

    initComponent: function() {
        this.items = [{
            //xtype: 'fieldset',
            //id: this.id + '_datasource_fieldset',
            //title: 'Data source',
            //autoHeight: true,
            //cls: 'x-form-item'
        //},{
            xtype: 'textfield',
            id: this.getId() + '_name',
            fieldLabel: OpenLayers.i18n('Name'),
            allowBlank: false,
            name: 'name',
            listeners: {
                valid: function(field) {
                    var  f = getFormPanel(this);
                    if (f) {
                        f.fireEvent('namechange', this, this.getValue());
                    }
                }
            }
        },{
            xtype: 'studio.mm.numberspinner',
            fieldLabel: OpenLayers.i18n('Opacity'),
            name: 'opacity',
            width: 40,
            minValue: 0,
            maxValue: 100,
            defaultValue: 100,
            incrementValue: 10
        }];
        if (this.properties.type != "raster") {
	        this.items.push({
	            xtype: 'studio.mm.columncombo',
	            layer: this.properties,
	            fieldLabel: OpenLayers.i18n('Label item'),
	            width: 100,
	            name: 'labelitem'
	        });
        }
        this.items.push({
            xtype: 'fieldset',
            title: OpenLayers.i18n('Limit by scale'),
            collapsed: true,
            checkboxToggle: true,
            height: 120,
            items: [{
                xtype: 'studio.mm.limitbyscale',
                map: this.map
            }],
            listeners: {
                scope: this,
                expand: function(p) { this.fireEvent('change'); },
                collapse: function(p) { this.fireEvent('change'); }
            }
        });
        if (this.properties.type != "raster") {
	        this.items.push({
	            xtype: 'fieldset',
	            title: OpenLayers.i18n('WFS attributes'),
	            collapsed: true,
	            checkboxToggle: true,
	            autoHeight: true,
	            defaults: {
	                border: false
	            },
	            items: [{
	                xtype: 'studio.mm.wfsattributes',
	                layer: this.properties,
	                width: 500, // TODO couldn't find how to fit to the container
	                autoHeight: true
	            },{
	                html: "<p class='info'>"+OpenLayers.i18n('Check the attributes you would want to see in a GetFeature WFS request response.') + "</p>"
	            }],
	            listeners: {
	                scope: this,
	                expand: function(p) { this.fireEvent('change'); },
	                collapse: function(p) { this.fireEvent('change'); }
	            }
	        });
        }

        Studio.MapfileMgr.LayerPropertiesPanel.superclass.initComponent.apply(this, arguments);
    }

    /**
     * Method: loadData
     * Fills the form with the data comming from the properties
     */
    //loadData: function() {
        //Studio.MapfileMgr.LayerPropertiesPanel.superclass.loadData.apply(this, arguments);

        //var el = Ext.getCmp(this.id + '_datasource_fieldset');
        //el.body.update(this.datasourceTpl.apply(this.properties.metadata));
    //}

});

Ext.reg('studio.mm.layerpropertiespanel', Studio.MapfileMgr.LayerPropertiesPanel);
