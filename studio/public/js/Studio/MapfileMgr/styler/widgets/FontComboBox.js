Studio.MapfileMgr.FontComboBox = Ext.extend(Ext.form.ComboBox, {
    valueField: 'id',
    displayField: 'name'
});
Ext.reg('studio.mm.fontcombo', Studio.MapfileMgr.FontComboBox);
