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

Studio.MapfileMgr.FillStylePanel = Ext.extend(Studio.MapfileMgr.MapfilePanel, {
    kind: OpenLayers.i18n('Fill style'),

    /**
     * Property: mapfileInterface
     * The currently selected MapFileInterface
     * {Studio.interface.MapfileInterface}
     */
    mapfileInterface: null,

    initComponent: function() {
        var config = {
            width: '100%',
            border: false,
            layout: 'column',
            defaults: {
                layout: 'form',
                labelWidth: 100,
                border: false,
                columnWidth: .5,
                defaults: {
                    width: 100,
                    listWidth: 100
                }
            }
        };

        Ext.applyIf(this, config);
        this.items = [{
            bodyStyle: "padding: 0 5px 0 0",
            items: [{
                xtype: 'studio.mm.colorpickerfield',
                fieldLabel: OpenLayers.i18n('Color'),
                name: 'color'
            }, {
                xtype: 'studio.mm.numberspinner',
                fieldLabel: OpenLayers.i18n('Opacity'),
                name: 'opacity',
                width: 40,
                minValue: 0,
                maxValue: 100,
                defaultValue: 100,
                incrementValue: 10
            }, {
                xtype: 'studio.mm.numberspinner',
                fieldLabel: OpenLayers.i18n('Angle'),
                name: 'angle',
                width: 40,
                defaultValue: 0,
                minValue: -180,
                maxValue: 360,
                incrementValue: 45
            }]
        }, {
            bodyStyle: "padding: 0 0 0 5px",
            items: [{
                xtype: 'studio.mm.symbolcombo',
                fieldLabel: OpenLayers.i18n('Symbol'),
                name: 'symbol',
                store: this.mapfileInterface.getSymbolsStore('isFill'),
                listeners: {
                    selectpvi: this.symbolChanged,
                    scope: this
                }
            },{
                id: this.getId() + "_size",
                xtype: 'studio.mm.numberspinner',
                fieldLabel: OpenLayers.i18n('Symbol size'),
                name: 'size',
                width: 40,
                minValue: 1
            }, {  //TODO: should be smaller than size for hashes
                xtype: 'studio.mm.numberspinner',
                id: this.getId() + "_width",
                fieldLabel: OpenLayers.i18n('Width'),
                name: 'width',
                width: 40,
                minValue: 1
            }]
        }];
        Studio.MapfileMgr.FillStylePanel.superclass.initComponent.apply(this, arguments);
    },

    symbolChanged: function(combo, v) {
        var empty = (v == null || v === "");
        Ext.getCmp(this.getId() + "_size").setDisabled(empty);
        Ext.getCmp(this.getId() + "_width").setDisabled(empty);
    }
});
Ext.reg('studio.mm.fillstyle', Studio.MapfileMgr.FillStylePanel);
