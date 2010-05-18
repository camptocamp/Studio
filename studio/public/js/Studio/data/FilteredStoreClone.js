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

Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.StoreClone
 *
 * A clone of a store that updates itself whenever the cloned store is modified.
 */

Studio.data.FilteredStoreClone = function(config) {
    var fields = config.fields = [];
    config.mainStore.fields.each(function(cur) {
        fields.push({name: cur.name,  mapping: 'data.' + cur.name});
    }, this);
    config.root = "items";

    Studio.data.FilteredStoreClone.superclass.constructor.call(this, config);

    this.sync();
    this.mainStore.on('load', this.sync, this);
    this.mainStore.on('add', this.sync, this);
    this.mainStore.on('remove', this.sync, this);
    this.mainStore.on('update', this.sync, this);
};

Ext.extend(Studio.data.FilteredStoreClone, Ext.data.JsonStore, {
    mainStore: null,

    sync: function() {
        var data = this.mainStore.queryBy(this.filterMethod, this);
        this.loadData(data, false);
    },

    /**
     * APIMethod: filterMethod
     * Returns true if the given record has to be taken
     */
    filterMethod: null
});