Studio.MapfileMgr.SymbolComboBox = Ext.extend(Studio.ComboBoxWithEmpty, {
    valueField: 'id',
    displayField: 'name'
});
Ext.reg('studio.mm.symbolcombo', Studio.MapfileMgr.SymbolComboBox);
