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

Ext.namespace('Studio', 'Studio.DataMgr');

Studio.DataMgr.Chooser = Ext.extend(Studio.Chooser, {

    // overrides
    subPanelXType: "studio.dm.panel",
    allowDelete: false,
    allowExport: false,
    allowCreateNew: false,
    label: "datastore",
    labels: "datastores",
    textField: "text",

    /**
     * Method: initComponent
     * Initialize the chooser panel.
     */
    initComponent : function() {
        this.storeType = Studio.datastoreStore;
        Studio.DataMgr.Chooser.superclass.initComponent.call(this);
    }
});

Ext.reg('studio.dm.chooser', Studio.DataMgr.Chooser);
