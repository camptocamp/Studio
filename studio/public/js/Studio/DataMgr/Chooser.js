Ext.namespace('Studio', 'Studio.DataMgr');

Studio.DataMgr.Chooser = Ext.extend(Studio.Chooser, {
    /**
     */
    subPanelXType: 'studio.dm.panel',

    /**
     *
     */
    allowDelete: false,

    /**
     *
     */
    allowExport: false,

    /**
     *
     */
    allowCreateNew: false,

    /**
     */
    label: 'datastore',

    /**
     */
    labels: 'datastores',

    /**
     */
    textField: 'text',

    /**
     * Method: initComponent
     * Initialize the chooser panel.
     */
    initComponent : function() {
        this.storeType = Studio.datastoreStore;
        Studio.DataMgr.Chooser.superclass.initComponent.call(this);
    }
});

Ext.reg('studio.dm.chooser', Studio.DataMgr.Chooser);
