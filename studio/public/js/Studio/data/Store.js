Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.Store
 *
 * Ship the standard rest methods to interface a web service.
 */
Studio.data.Store = function(config){
    Ext.apply(this, config);
};
    
Studio.data.Store.prototype = {
    /**
     * Property: url
     * {String} The url to interface the web service.
     */
    url: null,

    /**
     * Property: store
     * {String} The store to store data on client side
     */
    store: null,

    /**
     * Property: root
     * {String} The root item for the store
     */
    root: null,

    /**
     * Property: recordClass
     * {String} The class used to create a new record
     */
    recordClass: null,

    /**
     * Method: getStore
     * A method for accessing the store, the store is created
     * if it doesn't exist yet.
     */
    getStore: function() {
        if (this.store) {
            return this.store;
        }   
        
        this.store = new Ext.data.JsonStore({
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: 'GET'
            }),
            root: this.root,
            fields: this.recordClass
        }); 
        
        return this.store;
    }   
};
