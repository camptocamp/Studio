Ext.namespace('Studio', 'Studio.DataMgr');

Studio.DataMgr.Panel = Ext.extend(Ext.Panel, {
    layout: "border",

    defaults: {
        border: false
    },

    currentRecordInterface: null,

    tree: null,

    loadFromRecord: function() {
        this.datastoreId = this.record.id;
        var dataSources = this.record.datasources;
        var newDsNode = this.tree.root.findChild('role', 'new-datasource');
        for (var i = 0, len = dataSources.length; i < len; i++) {
            if (this.tree.root.findChild('id', dataSources[i].id) == null) {
                // insert new child
                this.tree.root.insertBefore(dataSources[i], newDsNode);
            }
        }
    },

    /**
     * Method: initComponent
     * Initialize the Data Manager Panel.
     */
    initComponent: function() {
        this.items = [{
            region: 'west',
            width: 400,
            layout: 'fit',
            split: true,
            items: [{
                layout: 'border',
                border: false,
                defaults: {
                    border: false
                },
                items: [
                    this.getElementsTreePanel()
                ]
            }]
        },
            this.getPropertiesPanel()
        ];

        this.tbar = [{
            text: OpenLayers.i18n('<-- Back to datastores list'),
            handler: function() {
                this.destroy(); 
           },
           scope: this
        }];

        Studio.DataMgr.Panel.superclass.initComponent.call(this);
    },
    
    getElementsTreePanel: function() {
        var newDataSourceNode = {
            text: OpenLayers.i18n('Add a new datasource ...'),
            cls: "add-txt",
            iconCls: "add",
            leaf: true,
            role: 'new-datasource'
        };

        this.tree = new Ext.tree.TreePanel({
            region: 'center',
            rootVisible: false,
            autoScroll: true,
            singleExpand: true,
            root: new Ext.tree.AsyncTreeNode({
                text: 'invisible tree node',
                children: [newDataSourceNode]
            })
        });
        this.tree.getSelectionModel().on('beforeselect', this.treeOnBeforeSelect, this);
        this.tree.getSelectionModel().on('selectionchange', this.treeOnSelect, this);

        return this.tree;
    },


    treeOnSelect: function(sm, node) {
        if (node) {
            var properties = node.attributes;
            if (properties.role && properties.role == 'new-datasource') {
                var window = new Studio.DataMgr.AddDatasourceWindow({
                    datastoreId: this.datastoreId
                });
                window.on('fileuploaded', function(window) {
                    var store = Studio.getDatasourceStore(this.datastoreId).store;
                    store.reload({
                        callback: function(records, options, success) {
                            this.record.datasources = [];
                            for (var i = 0, len = records.length; i < len; i++) {
                                this.record.datasources.push(records[i].data);
                            }
                            this.loadFromRecord();
                        },
                        scope: this
                    });
                }, this);
                window.show();
                this.tree.getSelectionModel().clearSelections();
            }
        }
    },

    treeOnBeforeSelect: function(sm, node) {
        // FIXME: validate user inputs
        return true;
    },

    getPropertiesPanel: function() {
        return {
            title: OpenLayers.i18n('Parameters'),
            region: 'center'
        };
    }

});

Ext.reg('studio.dm.panel', Studio.DataMgr.Panel);
