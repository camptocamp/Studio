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

Studio.MapfileMgr.LimitByConditionPanel = Ext.extend(Studio.MapfileMgr.MapfilePanel, {
    /**
     * Property: layer
     * The js object associated with the currently selected Layer
     * {Object}
     */
    layer: null,

    curColType: 'string',

    initComponent: function() {
        var config = {
            width: '100%',
            border: false,
            layout: 'form',
            defaults: {
                width: '100%'
            }
        };
        Ext.applyIf(this, config);

        //if someone is not happy about them not being in a single line, he can help himself. PVI quits.
        this.items = [{
            xtype: 'studio.mm.columncombo',
            id: this.getId() + '_column',
            fieldLabel: OpenLayers.i18n('Column'),
            layer: this.layer,
            name: 'column',
            listeners: {
                selectpvi: function(combo, v) {
                    // because of race conditions problems with visitors
                    // the following ensures that the value to be set
                    // in the value field is not lost
                    this.columnChanged.defer(100, this, [combo]);
                },
                scope: this
            }
        },{
            xtype: 'studio.mm.operatorcombo',
            width: 25,
            fieldLabel: OpenLayers.i18n('Operator'),
            name: 'operator'
        },{
            xtype: 'textfield',
            id: this.getId() + '_value',
            fieldLabel: OpenLayers.i18n('Value'),
            name: 'value'
        }];
        Studio.MapfileMgr.LimitByConditionPanel.superclass.initComponent.apply(this, arguments);
    },

    columnChanged: function(column) {
        var value = column.getValue();
        var type = Studio.getColumnType(this.layer, value);
        if (type != this.curColType) {
            var prevCmp = Ext.getCmp(this.getId() + '_value');
            var prevValue = prevCmp.getValue();
            var label = prevCmp.getEl().findParent("div.x-form-item", 10, true);
            this.remove(prevCmp);
            label.remove(); //hack to remove the leftover label (I love Ext's layouts)
            var newValue = {
                id: this.getId() + '_value',
                fieldLabel: OpenLayers.i18n('Value'),
                name: 'value',
                value: prevValue
            };
            switch (type) {
                case 'numeric':
                    Ext.applyIf(newValue, {
                        xtype: 'numberfield'
                    });
                    break;
                default:
                    Ext.applyIf(newValue, {
                        xtype: 'textfield'
                    });
                    break;
            }
            this.add(newValue);
            this.doLayout();
            this.curColType = type;
        }
    }
});
Ext.reg('studio.mm.limitbycondition', Studio.MapfileMgr.LimitByConditionPanel);
