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

