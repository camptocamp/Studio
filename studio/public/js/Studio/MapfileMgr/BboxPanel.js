Ext.namespace('Studio', 'Studio.MapfileMgr');

Studio.MapfileMgr.BboxPanel = Ext.extend(Studio.MapfileMgr.MapfilePanel, {
    /**
     * APIProperty: jsonName
     * The name of the bbox field in the mapfile
     * {string}
     */
    jsonName: null,

    width: '100%',
    border: false,
    layout: 'table',
    cls: 'studioBboxTable',

    initComponent: function() {
        var config = {
            layoutConfig: {
                columns: 3
            },
            defaults: {
                border: false,
                bodyStyle: 'padding: 0 5px 0 5px',
                width: '100%'
            }
        };
        Ext.applyIf(this, config);

        var id = this.getId();

        //TODO: add constraints
        //TODO: get value from extent
        this.items = [{

        }, {
            xtype: 'numberfield',
            id: id + '_maxy',
            validator: function(v) {
                if (parseFloat(v) <= parseFloat(Ext.getCmp(id + '_miny').getValue())) {
                    return OpenLayers.i18n('MaxValueBiggerThanMin');
                }
                return true;
            },
            allowBlank: false,
            value: 90,
            name: 'maxy',
            listeners: {
                change: this.onChange,
                scope: this
            }
        }, {

        }, /*end of row*/ {
            xtype: 'numberfield',
            id: id + '_minx',
            allowBlank: false,
            value: -180,
            validator: function(v) {
                if (parseFloat(v) >= parseFloat(Ext.getCmp(id + '_maxx').getValue())) {
                    return OpenLayers.i18n('MaxValueBiggerThanMin');
                }
                return true;
            },
            name: 'minx',
            listeners: {
                change: this.onChange,
                scope: this
            }
        }, {

        }, {
            xtype: 'numberfield',
            id: id + '_maxx',
            allowBlank: false,
            validator: function(v) {
                if (parseFloat(v) <= parseFloat(Ext.getCmp(id + '_minx').getValue())) {
                    return OpenLayers.i18n('MaxValueBiggerThanMin');
                }
                return true;
            },
            value: 180,
            name: 'maxx',
            listeners: {
                change: this.onChange,
                scope: this
            }
        },  /*end of row*/ {

        }, {
            xtype: 'numberfield',
            id: this.getId() + '_miny',
            allowBlank: false,
            name: 'miny',
            value: -90,
            validator: function(v) {
                if (parseFloat(v) >= parseFloat(Ext.getCmp(id + '_maxy').getValue())) {
                    return OpenLayers.i18n('MaxValueBiggerThanMin');
                }
                return true;
            },
            listeners: {
                change: this.onChange,
                scope: this
            }
        }
        ];
        Studio.MapfileMgr.BboxPanel.superclass.initComponent.apply(this, arguments);
    },

    onChange: function() {
        this.fireEvent('change', this);
    }
});
Ext.reg('studio.mm.bbox', Studio.MapfileMgr.BboxPanel);
