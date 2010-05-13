Studio.MapfileMgr.StrokeStylePanel = Ext.extend(Studio.MapfileMgr.MapfilePanel, {
    kind: OpenLayers.i18n('Stroke style'),

    /**
     * APIProperty: mapfileInterface
     * The currently selected MapFileInterface
     * {Studio.interface.MapfileInterface}
     */
    mapfileInterface: null,

    /**
     * APIProperty: geometryType
     *
     * One of 'polygon', 'line', 'point' or 'annotation'.
     */
    geometryType: null,

    initComponent: function() {
        var config = {
            width: '100%',
            border: false,
            layout: 'column',
            defaults: {
                layout: 'form',
                labelWidth: 100,
                border: false,
                columnWidth: .5,
                defaults: {
                    width: 100,
                    listWidth: 100
                }
            }
        };
        Ext.applyIf(this, config);

        var isLine = this.geometryType == 'line';
        this.items = [{
            bodyStyle: "padding: 0 5px 0 0",
            items: [{
                xtype: 'studio.mm.colorpickerfield',
                fieldLabel: isLine ? OpenLayers.i18n('Color') : OpenLayers.i18n('Outline color'),
                name: isLine ? "color" : "outlinecolor"
            }, {
                xtype: 'studio.mm.symbolcombo',
                fieldLabel: OpenLayers.i18n('Symbol'),
                name: 'symbol',
                store: this.mapfileInterface.getSymbolsStore('isStroke')
            }]
        }, {
            bodyStyle: "padding: 0 0 0 5px",
            items: [{
                xtype: 'studio.mm.numberspinner',
                fieldLabel: OpenLayers.i18n('Width'),
                name: 'width',
                width: 40,
                minValue: 1
            }]
        }];
        Studio.MapfileMgr.StrokeStylePanel.superclass.initComponent.apply(this, arguments);
    }
});
Ext.reg('studio.mm.strokestyle', Studio.MapfileMgr.StrokeStylePanel);
