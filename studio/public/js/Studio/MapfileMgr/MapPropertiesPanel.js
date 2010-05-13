Ext.namespace('Studio', 'MapfileMgr');

Studio.MapfileMgr.MapPropertiesPanel = Ext.extend(Studio.MapfileMgr.MapfileForm, {

    title: OpenLayers.i18n('MAP object properties'),
    autoScroll: true,

    initComponent: function() {

        this.items = [{
            xtype: 'textfield',
            fieldLabel: OpenLayers.i18n('Name'),
            name: 'name'
        },{
            xtype: 'textfield',
            fieldLabel: OpenLayers.i18n('Projection'),
            name: 'projection'
        },{
            xtype: 'numberfield',
            fieldLabel: OpenLayers.i18n('Maxsize'),
            name: 'maxsize',
            minValue: 1
        },{
            xtype: 'studio.unitcombo',
            fieldLabel: OpenLayers.i18n('Units'),
            name: 'units'
        },{
            xtype: 'numberfield',
            fieldLabel: OpenLayers.i18n('Resolution'),
            name: 'resolution'
        },{
            xtype: 'numberfield',
            fieldLabel: OpenLayers.i18n('Height'),
            name: 'height',
            minValue: 1
        },{
            xtype: 'numberfield',
            fieldLabel: OpenLayers.i18n('Width'),
            name: 'width',
            minValue: 1
        },{
            xtype: 'studio.mm.colorpickerfield',
            fieldLabel: OpenLayers.i18n('Image color'),
            name: 'imagecolor'
        },{
            xtype: 'fieldset',
            title: OpenLayers.i18n('extent'),
            autoHeight: true,
            items:{
                xtype: 'studio.mm.bbox',
                jsonName: 'extent'
            }
        }];

        Studio.MapfileMgr.MapPropertiesPanel.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('studio.mm.mappropertiespanel', Studio.MapfileMgr.MapPropertiesPanel);