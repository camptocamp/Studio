Studio.MapfileMgr.OperatorComboBox = Ext.extend(Ext.form.ComboBox, {
    editable: false,
    typeAhead: false,
    mode: 'local',
    triggerAction: 'all',
    forceSelection: true,
    emptyText: OpenLayers.i18n('not specified'),
    store: [
        ['<','<'],
        ['>','>'],
        ['<=','<='],
        ['>=','>='],
        ['==','=='],
        ['!=','!=']
    ]
});
Ext.reg('studio.mm.operatorcombo', Studio.MapfileMgr.OperatorComboBox);
