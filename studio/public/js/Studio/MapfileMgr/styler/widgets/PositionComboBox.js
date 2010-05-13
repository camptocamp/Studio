Studio.MapfileMgr.PositionComboBox = Ext.extend(Ext.form.ComboBox, {
    initComponent: function() {
        var config = {
            editable: false,
            typeAhead: false,
            mode: 'local',
            triggerAction: 'all',
            store: [
                ['auto', OpenLayers.i18n('auto')],
                ['ul', OpenLayers.i18n('upper left')],
                ['uc', OpenLayers.i18n('upper center')],
                ['ur', OpenLayers.i18n('upper right')],
                ['cl', OpenLayers.i18n('center left')],
                ['cc', OpenLayers.i18n('center center')],
                ['cr', OpenLayers.i18n('center right')],
                ['ll', OpenLayers.i18n('lower left')],
                ['lc', OpenLayers.i18n('lower center')],
                ['lr', OpenLayers.i18n('lower right')]
            ]
        };
        Ext.apply(this, config);
        Studio.MapfileMgr.PositionComboBox.superclass.initComponent.apply(this, arguments);
    }
});
Ext.reg('studio.mm.positioncombo', Studio.MapfileMgr.PositionComboBox);
