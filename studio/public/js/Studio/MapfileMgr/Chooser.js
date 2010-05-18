Ext.namespace('Studio', 'Studio.MapfileMgr');

Studio.MapfileMgr.Chooser = Ext.extend(Studio.Chooser, {
    /**
     */
    subPanelXType: 'studio.mm.panel',

    /**
     */
    label: OpenLayers.i18n('labelmapfile'),

    /**
     */
    labels: OpenLayers.i18n('labelmapfiles'),

    /**
     * Method: initComponent
     * Initialize the chooser panel.
     */
    initComponent : function() {
        this.storeType = Studio.mapfileStore;
        Studio.MapfileMgr.Chooser.superclass.initComponent.call(this);
    }
});

Ext.reg('studio.mm.chooser', Studio.MapfileMgr.Chooser);
