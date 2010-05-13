Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.DatastoreRecord
 *
 * A record containing a datastore and some info about it.
 */
Studio.data.DatastoreRecord = Ext.data.Record.create([
    {name: 'text'},
    {name: 'id'},
    {name: 'url', mapping: 'href'},
    {name: 'type'}
]);

/**
 * APIMethod: getInterface
 *
 * Returns:
 * {Studio.interface.DatastoreInterface} The datastoreInterface object. 
 */
Studio.data.DatastoreRecord.prototype.getInterface = function() {
    if (!this.interface) {
        this.interface = new Studio.interface.RestInterface(this);
    }
    return this.interface;
};


