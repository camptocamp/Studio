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

Studio.datastoreStore = new Studio.data.Store({
        url: null,
        root: 'datastores',
        recordClass: Studio.data.DatastoreRecord
});

Studio.mapfileStore = new Studio.data.Store({
        url: null,
        root: 'maps',
        recordClass: Studio.data.MapfileRecord
});

Studio.layertemplateStore = new Studio.data.Store({
        url: null,
        root: 'layertemplates',
        recordClass: Studio.data.LayertemplateRecord
});

Studio.datasourcesStores = {};

Studio.getDatasourceStore = function (datastore_id) {
    if (Studio.datasourcesStores[datastore_id]) {
            return Studio.datasourcesStores[datastore_id];
        }
    Studio.datasourcesStores[datastore_id] = new Studio.data.Store({
        url: subString(Studio.datastoreStore.datasourceUrlScheme, {"DATASTORE_ID": datastore_id}),
        root: 'datasources',
        recordClass: Studio.data.DatasourceRecord});
    Studio.datasourcesStores[datastore_id].getStore().load();

    return Studio.datasourcesStores[datastore_id];
};

Studio.getDatasourceColumnStore = function (datastore_id, datasource_id) {
    var datasource_store = Studio.getDatasourceStore(datastore_id);
    if (!datasource_store.datasourcesColumnsStores) {
        datasource_store.datasourcesColumnsStores = {};
    }
    if (datasource_store.datasourcesColumnsStores[datasource_id]) {
        return datasource_store.datasourcesColumnsStores[datasource_id];
    }

    datasource_store.datasourcesColumnsStores[datasource_id] = new Studio.data.Store({
        url: subString(Studio.datastoreStore.datasourceColumnsUrlScheme, {"DATASTORE_ID": datastore_id, "DATASOURCE_ID": datasource_id}),
        root: 'columns',
        recordClass: Studio.data.DatasourceColumnRecord});
    datasource_store.datasourcesColumnsStores[datasource_id].getStore().load();

    return datasource_store.datasourcesColumnsStores[datasource_id];
};

/**
 * Function: getColumnType
 * Get the type of column of a specified column from datasource
 */
//FIXME: where should this function be located?
Studio.getColumnType = function(layer, columnName) {
    if (!(layer.metadata && layer.metadata.datasourceid && layer.metadata.datastoreid)) {
        return null;
    }
    var store = Studio.getDatasourceColumnStore(layer.metadata.datastoreid, layer.metadata.datasourceid).getStore();
    var pos = store.find('name', columnName);
    if (pos < 0) {
        return null;
    }
    var record = store.getAt(pos);
    return record.get("type");
};

