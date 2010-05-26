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

Studio.MapfileMgr.BboxPanel = Ext.extend(Studio.MapfileMgr.MapfilePanel, {
    /**
     * APIProperty: jsonName
     * {String} The name of the bbox field in the mapfile.
     */
    jsonName: null,

    width: '100%',
    border: false,
    layout: 'table',
    cls: 'studioBboxTable',

    initComponent: function() {
        var config = {
            layoutConfig: {
                columns: 3
            },
            defaults: {
                border: false,
                bodyStyle: 'padding: 0 5px 0 5px',
                width: '100%'
            }
        };
        Ext.applyIf(this, config);

        var id = this.getId();

        //TODO: add constraints
        //TODO: get value from extent
        this.items = [{

        }, {
            xtype: 'numberfield',
            id: id + '_maxy',
            validator: function(v) {
                if (parseFloat(v) <= parseFloat(Ext.getCmp(id + '_miny').getValue())) {
                    return OpenLayers.i18n('MaxValueBiggerThanMin');
                }
                return true;
            },
            allowBlank: false,
            value: 90,
            name: 'maxy',
            listeners: {
                change: this.onChange,
                scope: this
            }
        }, {

        }, /*end of row*/ {
            xtype: 'numberfield',
            id: id + '_minx',
            allowBlank: false,
            value: -180,
            validator: function(v) {
                if (parseFloat(v) >= parseFloat(Ext.getCmp(id + '_maxx').getValue())) {
                    return OpenLayers.i18n('MaxValueBiggerThanMin');
                }
                return true;
            },
            name: 'minx',
            listeners: {
                change: this.onChange,
                scope: this
            }
        }, {

        }, {
            xtype: 'numberfield',
            id: id + '_maxx',
            allowBlank: false,
            validator: function(v) {
                if (parseFloat(v) <= parseFloat(Ext.getCmp(id + '_minx').getValue())) {
                    return OpenLayers.i18n('MaxValueBiggerThanMin');
                }
                return true;
            },
            value: 180,
            name: 'maxx',
            listeners: {
                change: this.onChange,
                scope: this
            }
        },  /*end of row*/ {

        }, {
            xtype: 'numberfield',
            id: this.getId() + '_miny',
            allowBlank: false,
            name: 'miny',
            value: -90,
            validator: function(v) {
                if (parseFloat(v) >= parseFloat(Ext.getCmp(id + '_maxy').getValue())) {
                    return OpenLayers.i18n('MaxValueBiggerThanMin');
                }
                return true;
            },
            listeners: {
                change: this.onChange,
                scope: this
            }
        }
        ];
        Studio.MapfileMgr.BboxPanel.superclass.initComponent.apply(this, arguments);
    },

    onChange: function() {
        this.fireEvent('change', this);
    }
});
Ext.reg('studio.mm.bbox', Studio.MapfileMgr.BboxPanel);
