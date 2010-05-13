Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.DatasourceColumnRecord
 *
 * A record containing a datasource column.
 */
Studio.data.DatasourceColumnRecord = Ext.data.Record.create([
    {name: 'name'},
    {name: 'type'}
]);

/**
 * APIMethod: getInterface
 *
 * Returns:
 * {Studio.interface.DatasourceColumnInterface} The datasourceColumnInterface object. 
 */
Studio.data.DatasourceColumnRecord.prototype.getInterface = function() {
    if (!this.interface) {
        this.interface = new Studio.interface.RestInterface(this);
    }
    return this.interface;
};


