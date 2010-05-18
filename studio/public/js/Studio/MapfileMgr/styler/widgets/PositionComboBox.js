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

Studio.MapfileMgr.PositionComboBox = Ext.extend(Ext.form.ComboBox, {
    initComponent: function() {
        var config = {
            editable: false,
            typeAhead: false,
            mode: 'local',
            triggerAction: 'all',
            store: [
                ['auto', OpenLayers.i18n('auto')],
                ['ul', OpenLayers.i18n('upper left')],
                ['uc', OpenLayers.i18n('upper center')],
                ['ur', OpenLayers.i18n('upper right')],
                ['cl', OpenLayers.i18n('center left')],
                ['cc', OpenLayers.i18n('center center')],
                ['cr', OpenLayers.i18n('center right')],
                ['ll', OpenLayers.i18n('lower left')],
                ['lc', OpenLayers.i18n('lower center')],
                ['lr', OpenLayers.i18n('lower right')]
            ]
        };
        Ext.apply(this, config);
        Studio.MapfileMgr.PositionComboBox.superclass.initComponent.apply(this, arguments);
    }
});
Ext.reg('studio.mm.positioncombo', Studio.MapfileMgr.PositionComboBox);
