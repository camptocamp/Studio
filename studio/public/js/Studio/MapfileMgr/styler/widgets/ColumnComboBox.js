Studio.MapfileMgr.ColumnComboBox = Ext.extend(Ext.form.ComboBox, {
    /**
     * Property: layer
     * The js object associated with the currently selected Layer
     * {Object}
     */
    layer: null,

    editable: false,
    mode: 'local',
    typeAhead: false,
    triggerAction: 'all',
    forceSelection: true,
    emptyText: OpenLayers.i18n('not specified'),
    store: null,
    valueField: 'name',
    displayField: 'name',

    initComponent: function() {
        if (this.layer.metadata && this.layer.metadata.datasourceid && this.layer.metadata.datastoreid) {
            this.store = Studio.getDatasourceColumnStore(this.layer.metadata.datastoreid, this.layer.metadata.datasourceid).getStore();
        }
        Studio.MapfileMgr.ColumnComboBox.superclass.initComponent.apply(this, arguments);
    }
});
Ext.reg('studio.mm.columncombo', Studio.MapfileMgr.ColumnComboBox);
