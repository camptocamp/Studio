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

Ext.namespace("Studio");

/**
 * Class: Studio.ComboBoxWithEmpty
 * A combobox with an entry for making the value=""
 */
Studio.ComboBoxWithEmpty = Ext.extend(Ext.form.ComboBox, {
    editable: false,
    typeAhead: false,
    mode: 'local',
    triggerAction: 'all',
    emptyText: OpenLayers.i18n('not specified'),

    initComponent: function() {
        if (this.store instanceof Array) {
            if (this.store[0][0] != '' && this.store[0][1] != this.emptyText) {
                this.store.unshift(['', this.emptyText]);
            }
        } else {
            if (this.store.getCount() > 0) {
                //store already loaded
                this.addEmptyData();
            }
            this.store.on('load', this.addEmptyData, this);
        }
        Studio.ComboBoxWithEmpty.superclass.initComponent.apply(this, arguments);
    },

    addEmptyData: function() {
        var store = this.initialConfig.store;
        if(!store) {
            alert("null store");
        }
        if (store.getCount()==0 || store.getAt(0).get(this.valueField) !== '') {
            //not already added
            var record = {};
            record[this.valueField] = '';
            record[this.displayField] = this.emptyText;
            store.insert(0, new store.recordType(record));
        }
    }
});
Ext.reg('studio.mm.comboempty', Studio.ComboBoxWithEmpty);
