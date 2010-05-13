Ext.namespace("Studio");

Studio.DatastoreCombo = Ext.extend(Ext.form.ComboBox, {
    fieldLabel: OpenLayers.i18n('DataStore'),
    emptyText: OpenLayers.i18n('Choose one store'),
    displayField: 'text',
    valueField: 'id',
    typeAhead: true,
    editable: false,
    mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
    selectOnFocus: true,
    iconClsField: 'icon',

    initComponent: function() {
        if (!this.store) {
            this.store = Studio.datastoreStore.getStore();
        }
        Studio.DatastoreCombo.superclass.initComponent.apply(this, arguments);

    }
});
Ext.reg('studio.datastorecombo', Studio.DatastoreCombo);
