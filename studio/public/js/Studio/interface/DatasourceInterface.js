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
 * Class: Studio.interface.DatasourceInterface
 *
 * Allows to read/write/update all the information about a Datasource.
 */
Studio.interface.DatasourceInterface = Ext.extend(Studio.interface.RestInterface, {

    /**
     * Method: getMapfileHref
     * Get the url to this corresponding resource.
     *
     * Returns:
     * {String} The url.
     */
    getMapfileHref: function() {
        return this.getHref() + "/mapfile";
    },

    /**
     * APIMethod: get_mapfile
     * Send a request to the server to obtain the mapfile part corresponding
     * to this datasource
     */
    "get_mapfile": function(config) {
        Ext.Ajax.request({
            url: this.getMapfileHref(),
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
    }

});

