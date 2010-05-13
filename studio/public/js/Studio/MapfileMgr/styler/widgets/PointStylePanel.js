Studio.MapfileMgr.PointStylePanel = Ext.extend(Studio.MapfileMgr.MapfilePanel, {
    kind: 'Point style',

    /**
     * Property: mapfileInterface
     * The currently selected MapFileInterface
     * {Studio.interface.MapfileInterface}
     */
    mapfileInterface: null,

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

        this.items = [{
            bodyStyle: "padding: 0 5px 0 0",
            items: [{
                xtype: 'studio.mm.colorpickerfield',
                fieldLabel: OpenLayers.i18n('Color'),
                name: "color"
            }, {
                xtype: 'studio.mm.colorpickerfield',
                fieldLabel: OpenLayers.i18n('Outline color'),
                name: "outlinecolor"
            }]
        }, {
            bodyStyle: "padding: 0 0 0 5px",
            items: [{
                xtype: 'studio.mm.numberspinner',
                fieldLabel: OpenLayers.i18n('Size'),
                name: 'size',
                width: 40,
                minValue: 1
            }, {
                xtype: 'studio.mm.symbolcombo',
                fieldLabel: OpenLayers.i18n('Symbol'),
                name: 'symbol',
                store: this.mapfileInterface.getSymbolsStore('isPoint')
            }, {
                xtype: 'studio.mm.numberspinner',
                fieldLabel: OpenLayers.i18n('Angle'),
                name: 'angle',
                width: 40,
                defaultValue: 0,
                minValue: -180,
                maxValue: 360,
                incrementValue: 45
            }]
        }];
        Studio.MapfileMgr.PointStylePanel.superclass.initComponent.apply(this, arguments);
    }
});
Ext.reg('studio.mm.pointstyle', Studio.MapfileMgr.PointStylePanel);
