Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.LayertemplateRecord
 *
 * A record containing a layertemplate and some info about it.
 */
Studio.data.LayertemplateRecord = Ext.data.Record.create([
    {name: 'name'},
    {name: 'comment'},
    {name: 'id'},
    {name: 'url', mapping: 'href'}
]);

/**
 * APIMethod: getInterface
 *
 * Returns:
 * {Studio.interface.LayertemplateInterface} The layertemplateInterface object. 
 */
Studio.data.LayertemplateRecord.prototype.getInterface = function() {
    if (!this.interface) {
        this.interface = new Studio.interface.RestInterface(this);
    }
    return this.interface;
};


