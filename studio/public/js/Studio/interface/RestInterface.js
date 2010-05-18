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
 * Constructor: Studio.interface.RestInterface
 *
 * Parameters:
 * record - {Studio.interface.xxxRecord} The record associated to that interface.
 */
Studio.interface.RestInterface = function(record) {
    this.record = record;
};

/**
 * Class: Studio.interface.RestInterface
 *
 * Define read/write/update interface actions.
 */
Studio.interface.RestInterface.prototype = {

    /**
     * Property: record
     * {Studio.data.xxxRecord} The record associated to that interface.
     */
    record: null,

    /**
     * Method: getId
     * Get this ressource id.
     *
     * Returns:
     * {String} The ressource id.
     */
    getId: function() {
        return this.record.get("id");
    },

    /**
     * Method: getHref
     * Get the url to this corresponding resource.
     *
     * Returns:
     * {String} The url.
     */
    getHref: function() {
        return this.record.get("url");
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
        return Ext.util.JSON.decode(json);
    },

    /**
     * Method: objToJson
     * Encode the js object into a JSON string.
     *
     * Parameters:
     * {Object} obj - the js Object
     *
     * Returns:
     * {String} The JSON string.
     */
    objToJson: function(obj) {
        return Ext.util.JSON.encode(obj);
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
            headers: {
              'Content-Type': "application/json; charset=UTF-8"
            },
            jsonData: this.objToJson(obj),
            callback: function(options, success, response) {
                if (response.status == 201) {
                    // update record id and url
                    var obj = Ext.util.JSON.decode(response.responseText);
                    this.record.data.id = obj.id;
                    this.record.data.url = obj.href;
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
     * APIMethod: read
     * Send a read request to the server.
     *
     * Parameters:
     * config - {Object} An object with the following properties:
     *     * success, a {Function} called when the object was
     *       successfully read
     *     * failure, a {Function} called when an error occurred
     *       while reading the object
     *     * scope, the scope used to call success or failure
     */
    "read": function(config) {
        Ext.Ajax.request({
            url: this.getHref(),
            method: "GET",
            callback: function(options, success, response) {
                if (response.status == 200) {
                    var obj = this.jsonToObj(response.responseText);
                    if (config && config.success) {
                        config.success.call(config.scope, obj);
                    }
                } else if (config && config.failure) {
                    config.failure.call(config.scope);
                }
            }.createDelegate(this)
        });
    },

    /**
     * APIMethod: update
     * Send an update request to the server.
     *
     * Parameters:
     * config - {Object} An object with the following properties:
     *     * success, a {Function} called when the object was
     *       successfully updated
     *     * failure, a {Function} called when an error occurred
     *       while updating the object
     *     * scope, the scope used to call success or failure
     *
     * obj - {Object} the js object
     */
    "update": function(config, obj) {
        Ext.Ajax.request({
            url: this.getHref(),
            method: "PUT",
            headers: {
              'Content-Type': "application/json; charset=UTF-8"
            },
            jsonData: this.objToJson(obj),
            callback: function(options, success, response) {
                if (response.status == 201) {
                    var obj;
                    if (response.responseText) {
                        obj = this.jsonToObj(response.responseText);
                    }
                    if (config && config.success) {
                        config.success.call(config.scope, obj);
                    }
                } else if (config && config.failure) {
                    config.failure.call(config.scope);
                }
            }.createDelegate(this)
        });
    },

    /**
     * APIMethod: delete
     * Send a delete request to the server.
     *
     * Parameters:
     * config - {Object} An object with the following properties:
     *     * success, a {Function} called when the object was
     *       successfully deleted
     *     * failure, a {Function} called when an error occurred
     *       while deleting the object
     *     * scope, the scope used to call success or failure
     */
    "delete": function(config) {
        // if the object does not have an id it means that it is
        // unknown to the server, in that case we don't actually
        // send a delete request and just call the success callback
        if (this.getId() == null) {
            if (config && config.success) {
                config.success.call(config.scope);
            }
        } else {
            Ext.Ajax.request({
                url: this.getHref(),
                method: "DELETE",
                callback: function(options, success, response) {
                    if (response.status == 204) {
                        if (config && config.success) {
                            config.success.call(config.scope);
                        }
                    } else if (config && config.failure) {
                        config.failure.call(config.scope);
                    }
                }.createDelegate(this)
            });
        }
    },

    /**
     * APIMethod: createOrUpdate
     * If the id is undefined send a request server to the server,
     * else send an update request to the server.
     *
     * Parameters:
     * config - {Object} An object with the following properties:
     *     * success, a {Function} called when the object was
     *       successfully created or updated
     *     * failure, a {Function} called when an error occurred
     *       while creating or updating the object
     *     * scope, the scope used to c
     *
     * obj - {Object} the js object
     */
    "createOrUpdate": function(config, obj) {
        if (this.getId() == null) {
            this.create(config, obj);
        } else {
            this.update(config, obj);
        }
    }

};

