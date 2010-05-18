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

Studio.DatastoreCombo = Ext.extend(Ext.form.ComboBox, {
    fieldLabel: OpenLayers.i18n('DataStore'),
    emptyText: OpenLayers.i18n('Choose one store'),
    displayField: 'text',
    valueField: 'id',
    typeAhead: true,
    editable: false,
    mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
    selectOnFocus: true,
    iconClsField: 'icon',

    initComponent: function() {
        if (!this.store) {
            this.store = Studio.datastoreStore.getStore();
        }
        Studio.DatastoreCombo.superclass.initComponent.apply(this, arguments);

    }
});
Ext.reg('studio.datastorecombo', Studio.DatastoreCombo);
