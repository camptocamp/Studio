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

Ext.namespace('Studio', 'MapfileMgr');

Studio.MapfileMgr.MapPropertiesPanel = Ext.extend(Studio.MapfileMgr.MapfileForm, {

    title: OpenLayers.i18n('MAP object properties'),
    autoScroll: true,

    initComponent: function() {

        this.items = [{
            xtype: 'textfield',
            fieldLabel: OpenLayers.i18n('Name'),
            name: 'name'
        },{
            xtype: 'textfield',
            fieldLabel: OpenLayers.i18n('Projection'),
            name: 'projection'
        },{
            xtype: 'numberfield',
            fieldLabel: OpenLayers.i18n('Maxsize'),
            name: 'maxsize',
            minValue: 1
        },{
            xtype: 'studio.unitcombo',
            fieldLabel: OpenLayers.i18n('Units'),
            name: 'units'
        },{
            xtype: 'numberfield',
            fieldLabel: OpenLayers.i18n('Resolution'),
            name: 'resolution'
        },{
            xtype: 'numberfield',
            fieldLabel: OpenLayers.i18n('Height'),
            name: 'height',
            minValue: 1
        },{
            xtype: 'numberfield',
            fieldLabel: OpenLayers.i18n('Width'),
            name: 'width',
            minValue: 1
        },{
            xtype: 'studio.mm.colorpickerfield',
            fieldLabel: OpenLayers.i18n('Image color'),
            name: 'imagecolor'
        },{
            xtype: 'fieldset',
            title: OpenLayers.i18n('extent'),
            autoHeight: true,
            items:{
                xtype: 'studio.mm.bbox',
                jsonName: 'extent'
            }
        }];

        Studio.MapfileMgr.MapPropertiesPanel.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('studio.mm.mappropertiespanel', Studio.MapfileMgr.MapPropertiesPanel);