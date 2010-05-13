Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.DatasourceRecord
 *
 * A record containing a datasource and some info about it.
 */
Studio.data.DatasourceRecord = Ext.data.Record.create([
    {name: 'text'},
    {name: 'id'},
    {name: 'type'},
    {name: 'url', mapping: 'href'},
    {name: 'leaf'}
]);

/**
 * APIMethod: getInterface
 *
 * Returns:
 * {Studio.interface.DatasourceInterface} The datasourceInterface object. 
 */
Studio.data.DatasourceRecord.prototype.getInterface = function() {
    if (!this.interface) {
        this.interface = new Studio.interface.DatasourceInterface(this);
    }
    return this.interface;
};


