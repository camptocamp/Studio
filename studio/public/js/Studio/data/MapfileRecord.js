Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.MapfileRecord
 *
 * A record containing a mapfile and some info about it.
 */
Studio.data.MapfileRecord = Ext.data.Record.create([
    {name: 'name'},
    {name: 'id'},
    {name: 'url', mapping: 'href'},  //the REST URL for getting the MapFile content
    {name: 'wmsurl'},   //the URL for the WMS
    {name: 'wmsproxyurl'}   //the URL for the WMS proxy
]);

/**
 * APIMethod: getInterface
 *
 * Returns:
 * {Studio.interface.MapfileInterface} The mapfileInterface object. 
 */
Studio.data.MapfileRecord.prototype.getInterface = function() {
    if (!this.interface) {
        this.interface = new Studio.interface.MapfileInterface(this);
    }
    return this.interface;
};


