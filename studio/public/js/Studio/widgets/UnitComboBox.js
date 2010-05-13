Ext.namespace("Studio");

Studio.UnitComboBox = Ext.extend(Studio.ComboBoxWithEmpty, {
    store: [
        ['feet', OpenLayers.i18n('feet')],
        ['inches', OpenLayers.i18n('inches')],
        ['kilometers', OpenLayers.i18n('kilometers')],
        ['meters', OpenLayers.i18n('meters')],
        ['miles', OpenLayers.i18n('miles')],
        ['dd', OpenLayers.i18n('dd')],
        ['pixels', OpenLayers.i18n('pixels')],
        ['percentages', OpenLayers.i18n('percentages')]
    ]
});
Ext.reg('studio.unitcombo', Studio.UnitComboBox);
