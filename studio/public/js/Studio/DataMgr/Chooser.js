Ext.namespace('Studio', 'Studio.DataMgr');

Studio.DataMgr.Chooser = Ext.extend(Studio.Chooser, {
    label: 'datastore',
    labels: 'datastores',
    subPanelXType: 'studio.dm.panel',
    textField: 'text',

    elemNodeUIActions: [{
        action: 'delete',
        qtip: OpenLayers.i18n('delete datastore')
    }],

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
