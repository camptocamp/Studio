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

Ext.namespace('Studio', 'Studio.interface');

/**
 * Class: Studio.interface.MapfileInterface
 *
 * Allows to read/write/update all the information about a Mapfile.
 */
Studio.interface.MapfileInterface = Ext.extend(Studio.interface.RestInterface, {

    /**
     * Property: symbols
     * {Ext.data.JsonStore} The Json store for the symbols.
     */
    symbols: null,

    /**
     * Property: filteredSymbols
     *
     * {Object} Filtered versions of the symbols stores, indexed by criteria.
     */
    filteredSymbols: null,

    /**
     * Property: fonts
     * {Ext.data.JsonStore} The Json store for the fonts.
     */
    fonts: null,

    /**
     * Method: getHref
     * Get the url to this Mapfile's corresponding resource.
     *
     * Returns:
     * {String} The url.
     */
    getHref: function() {
        return this.record.get("url") ||
               Studio.mapfileStore.url + "/default";
    },

    /**
     * Method: getWMSProxy
     * Get the url to this Mapfile's corresponding WMS proxy server.
     *
     * Returns:
     * {String} The url.
     */
    getWMSProxy: function() {
        return this.record.get("wmsproxyurl");
    },

    /**
     * Method: getWMS
     * Get the url to this Mapfile's corresponding WMS server.
     *
     * Returns:
     * {String} The url.
     */
    getWMS: function() {
        return this.record.get("wmsurl");
    },

    /**
     * Method: jsonToObj
     * Decode a JSON string into the js object.
     *
     * Parameters:
     * {String} json - the JSON string.
     *
     * Returns:
     * {String} the js Object
     */
    jsonToObj: function(json) {
        var obj = Ext.util.JSON.decode(json).map;
        obj.name = this.record.get("name");
        return obj;
    },

    /**
     * APIMethod: getFontsStore
     * Get the store of fonts, creating it if it doesn't
     * exist yet.
     *
     * Returns:
     * {Ext.data.JsonStore} The fonts store.
     */
    getFontsStore: function() {
        if (this.fonts) {
            return this.fonts;
        } else {
            this.fonts = new Ext.data.JsonStore({
                proxy: new Ext.data.HttpProxy({
                    url: this.getHref() + '/fonts',
                    method: 'GET'
                }),
                root: 'fonts',
                fields: ['name', 'id']
            });
            this.fonts.load();
            return this.fonts;
        }
    },

    /**
     * APIMethod: getSymbolsStore
     * Get the store of symbols, creating it if it doesn't
     * exist yet.
     *
     * Parameters:
     * filter - {String} the attribute to filter on
     *
     * Returns:
     * {Ext.data.JsonStore} The symbols store.
     */
    getSymbolsStore: function(filter) {
        if (!this.symbols) {
            this.symbols = new Ext.data.JsonStore({
                proxy: new Ext.data.HttpProxy({
                    url: this.getHref() + '/symbols',
                    method: 'GET'
                }),
                root: 'symbols',
                fields: ['name', 'id', 'isPoint', 'isStroke', 'isFill']
            });
            this.symbols.load();
            this.filteredSymbols = {};
        }

        if (filter) {
            if (!this.filteredSymbols[filter]) {
                this.filteredSymbols[filter] = new Studio.data.FilteredStoreClone({
                    mainStore: this.symbols,
                    filterMethod: function(record, id) {
                        var value = record.get(filter);
                        return value === null || value;
                    }
                });
            }
            return this.filteredSymbols[filter];
        } else {
            return this.symbols;
        }
    },

    /**
     * APIMethod: create
     * Send a create request to the server.
     *
     * Parameters:
     * config - {Object} An object with the following properties:
     *     * success, a {Function} called when the object was
     *       successfully created
     *     * failure, a {Function} called when an error occurred
     *       while creating the object
     *     * scope, the scope used to call success or failure
     *
     * obj - {Object} the js object to be created
     */
    "create": function(config, obj) {
        Ext.Ajax.request({
            url: this.record.store.proxy.conn.url,
            method: "POST",
            jsonData: this.objToJson(obj),
            callback: function(options, success, response) {
                if (response.status == 201) {
                    // update record id and url
                    var obj = Ext.util.JSON.decode(response.responseText);
                    this.record.data.id = obj.id;
                    this.record.data.url = obj.href;
                    // update record wmsurl and wmsproxyurl (specific to MapfileInterface)
                    this.record.data.wmsproxyurl = obj.wmsproxyurl;
                    this.record.data.wmsurl = obj.wmsurl;
                    if (config && config.success) {
                        config.success.call(config.scope);
                    }
                } else if (config && config.failure) {
                    config.failure.call(config.scope);
                }
            }.createDelegate(this)
        });
    },

    /**
     * APIMethod: download
     * Redirect to mapfile download server url
     */
    "download": function() {
        window.location.href = this.getHref() + '/download';
    }

});

