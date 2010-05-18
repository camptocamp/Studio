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
