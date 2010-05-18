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

Studio.MapfileMgr.ColumnComboBox = Ext.extend(Ext.form.ComboBox, {
    /**
     * Property: layer
     * The js object associated with the currently selected Layer
     * {Object}
     */
    layer: null,

    editable: false,
    mode: 'local',
    typeAhead: false,
    triggerAction: 'all',
    forceSelection: true,
    emptyText: OpenLayers.i18n('not specified'),
    store: null,
    valueField: 'name',
    displayField: 'name',

    initComponent: function() {
        if (this.layer.metadata && this.layer.metadata.datasourceid && this.layer.metadata.datastoreid) {
            this.store = Studio.getDatasourceColumnStore(this.layer.metadata.datastoreid, this.layer.metadata.datasourceid).getStore();
        }
        Studio.MapfileMgr.ColumnComboBox.superclass.initComponent.apply(this, arguments);
    }
});
Ext.reg('studio.mm.columncombo', Studio.MapfileMgr.ColumnComboBox);
