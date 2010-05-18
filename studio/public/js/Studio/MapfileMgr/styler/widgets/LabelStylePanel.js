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

Studio.MapfileMgr.LabelStylePanel = Ext.extend(Studio.MapfileMgr.MapfilePanel, {
    /**
     * Property: mapfileInterface
     * The currently selected MapFileInterface
     * {Studio.interface.MapfileInterface}
     */
    mapfileInterface: null,

    /**
     * APIProperty: geometryType
     *
     * One of 'polygon', 'line', 'point' or 'annotation'.
     */
    geometryType: null,

    initComponent: function() {
        var config = {
            width: '100%',
            border: false,
            defaults: {
                border: false
            }
        };
        Ext.applyIf(this, config);

        var angle;
        if (this.geometryType == "line") {
            angle = {
                xtype: 'studio.mm.radionumberspinner',
                id: this.getId() + "_angle",
                fieldLabel: OpenLayers.i18n('Angle'),
                name: 'angle',
                choices: {auto: OpenLayers.i18n('auto'), follow: OpenLayers.i18n('follow')},
                width: '100%'
            };
        } else {
            angle = {
                xtype: 'studio.mm.numberspinner',
                fieldLabel: OpenLayers.i18n('Angle'),
                name: 'angle',
                width: 40,
                defaultValue: 0,
                minValue: -180,
                maxValue: 360,
                incrementValue: 45
            };
        }

        this.items = [{
            layout: 'column',
            defaults: {
                layout: 'form',
                labelWidth: 100,
                border: false,
                columnWidth: 0.5,
                defaults: {
                    width: 100,
                    listWidth: 100
                }
            },
            items: [{
                bodyStyle: "padding: 0 5px 0 0",
                items:[{
                    xtype: 'studio.mm.fontcombo',
                    fieldLabel: OpenLayers.i18n('Font'),
                    name: 'font',
                    store: this.mapfileInterface.getFontsStore(),
                    value: 'default'
                },{
                    xtype: 'studio.mm.numberspinner',
                    fieldLabel: OpenLayers.i18n('Size'),
                    name: 'size',
                    width: 40,
                    minValue: 1,
                    value: 8
                },{
                    xtype: 'studio.mm.numberspinner',
                    fieldLabel: OpenLayers.i18n('Priority'),
                    width: 40,
                    name: 'priority',
                    minValue: 1,
                    maxValue: 10
                },{
                    xtype: 'studio.mm.numberspinner',
                    fieldLabel: OpenLayers.i18n('Buffer'),
                    width: 40,
                    name: 'buffer',
                    minValue: 0
                }]
            },{
                bodyStyle: "padding: 0 0 0 5px",
                items:[{
                    xtype: 'studio.mm.colorpickerfield',
                    fieldLabel: OpenLayers.i18n('Color'),
                    name: 'color',
                    value: '#000000'
                },{
                    xtype: 'studio.mm.colorpickerfield',
                    fieldLabel: OpenLayers.i18n('Outline color'),
                    name: 'outlinecolor'
                },{
                    xtype: 'studio.mm.positioncombo',
                    fieldLabel: OpenLayers.i18n('Position'),
                    name: 'position'
                }, angle]
            }]
        },{

            html: "<p class='info'>"+OpenLayers.i18n("Don't forget to set a value for labelitem at the layer level")+"</p>"
        }];
        Studio.MapfileMgr.LabelStylePanel.superclass.initComponent.apply(this, arguments);
    }
});
Ext.reg('studio.mm.labelstyle', Studio.MapfileMgr.LabelStylePanel);
