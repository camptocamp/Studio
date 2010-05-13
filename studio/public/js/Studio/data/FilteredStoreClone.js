Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.StoreClone
 *
 * A clone of a store that updates itself whenever the cloned store is modified.
 */

Studio.data.FilteredStoreClone = function(config) {
    var fields = config.fields = [];
    config.mainStore.fields.each(function(cur) {
        fields.push({name: cur.name,  mapping: 'data.' + cur.name});
    }, this);
    config.root = "items";

    Studio.data.FilteredStoreClone.superclass.constructor.call(this, config);

    this.sync();
    this.mainStore.on('load', this.sync, this);
    this.mainStore.on('add', this.sync, this);
    this.mainStore.on('remove', this.sync, this);
    this.mainStore.on('update', this.sync, this);
};

Ext.extend(Studio.data.FilteredStoreClone, Ext.data.JsonStore, {
    mainStore: null,

    sync: function() {
        var data = this.mainStore.queryBy(this.filterMethod, this);
        this.loadData(data, false);
    },

    /**
     * APIMethod: filterMethod
     * Returns true if the given record has to be taken
     */
    filterMethod: null
});