Ext.namespace('Studio');

Studio.Chooser = Ext.extend(Ext.Panel, {
    treePanel: null,

    layout: "card",

    storeType: null,
    label: null,
    labels: null,
    subPanelXType: null,
    textField: 'name',
    
    elemNodeUIActions: null,

    /**
     * Method: initComponent
     * Initialize the chooser panel.
     */
    initComponent : function() {
        this.activeItem = this.getId() + '-chooser';
        Studio.Chooser.superclass.initComponent.call(this);

        this.on({
            activate: this.doLayout,
            render: function() {
                this.add({
                    id: this.getId() + '-chooser',
                    items: [
                        this.createChooserPanel()
                    ]
                });
            },
            scope: this
        });
    },

    createChooserPanel: function() {
        var elemNodeUI = Ext.extend(Ext.tree.ActionsNodeUI, {
            actions: this.elemNodeUIActions || [{
            action: 'script_save',
            qtip: OpenLayers.i18n('export' + this.label)
        },{
            action: 'delete',
            qtip: OpenLayers.i18n('delete' + this.label)
        }]
        });

        var treePanel = this.treePanel = new Ext.tree.TreePanel({
            rootVisible: true,
            width: 300,
            border: false,
            root: new Ext.tree.AsyncTreeNode({
                text: this.labels,
                expanded: true,
                children: [{
                    text: OpenLayers.i18n("createnew" + this.label),
                    cls: "add-txt",
                    iconCls: "add",
                    leaf: true,
                    role: 'new-elem',
                    listeners: {
                        click: function(n) {
                            var s = this.storeType.getStore();
                            var record = new s.recordType({id: null, url: null});
                            record.set(this.textField, OpenLayers.i18n('DefaultName'));
                            s.add(record);
                            var newNode = treePanel.getRootNode().lastChild; //get the node that was just created
                            this.loadRecord(record, newNode);
                        },
                        scope: this
                    }
                }]
            }),
            loader: new Ext.tree.TreeLoader({
                uiProviders: {
                    'elem': elemNodeUI
                }
            })
        });

        treePanel.getSelectionModel().on({
            beforeselect: this.elemListTreeOnBeforeSelect,
            selectionchange: this.elemListTreeOnSelect,
            scope: this
        });

        treePanel.on('action', function(node, action, e) {
            var recordInterface = node.attributes.record.getInterface();
            if (action == 'delete') {
                Ext.Msg.confirm(
                		OpenLayers.i18n("discard" + this.label),
                		OpenLayers.i18n("Are you sure you want to discard this " + this.label + " ?"),
                        function(a) {
                            if (a == "yes") {
                                recordInterface["delete"]({
                                    failure: function() {
                                        Ext.Msg.alert(
                                                'Error',
                                                'An error occurred while discarding ' +
                                                'the ' + this.label + ', please report the ' +
                                                'problem.'
                                                );
                                    },
                                    success: function() {
                                        this.storeType.store.reload();
                                    },
                                    scope: this
                                });
                            }
                        },
                        this
                        );
                // return false so that the selection model's
                // selectionchange event does not trigger
                return false;
            }
            if (action == 'script_save') {
                recordInterface["download"]();

                // return false so that the selection model's
                // selectionchange event does not trigger
                return false;
            }
        }, this);

        // on each load and add in the store, update the
        // tree with the loaded records
        // don't remove existing records if append is set to true 
        function addRecordsToTree(records, append) {
            var root = treePanel.getRootNode();
            if (!append) {
                var len = root.childNodes.length;
                for (var i = len - 1; i > 0; i--) {
                    var node = root.childNodes[i];
                    if (node.attributes.role != 'new-elem') {
                        node.remove();
                    }
                }
            }
            Ext.each(records, function(item, index, records) {
                var node = {
                    text: item.data[this.textField],
                    id: item.data.id,
                    uiProvider: "elem",
                    qtip: OpenLayers.i18n('edit' + this.label),
                    role: 'elem',
                    record: item,
                    leaf: true
                };
                root.appendChild(node);
            }, this);
        }

        var store = this.storeType.getStore();

        store.on({
            load: function(store, records) {
                addRecordsToTree.apply(this, [records]);
            },
            add: function(store, records) {
                addRecordsToTree.apply(this, [records, true]);
            },
            scope: this
        });
        store.load();

        return treePanel;
    },

    elemListTreeOnBeforeSelect: function(sm, node) {
        // unselectable nodes
    },

    elemListTreeOnSelect: function(sm, node) {
        if (node && node.attributes.role == 'elem') {
            this.loadRecord(node.attributes.record, node);
        }
    },

    /**
     * Method: loadRecord
     *
     * Parameters
     * record {Ext.data.Record}
     * node {Ext.tree.TreeNode}
     */
    loadRecord: function(record, node) {
        var recordInterface = record.getInterface();
        recordInterface.read({
            success: function(obj) {
                var panel = this.add({
                    id: this.getId() + 'editing_panel',
                    xtype: this.subPanelXType,
                    record: obj,
                    node: node,
                    currentRecordInterface: recordInterface,
                    listeners: {
                        destroy: function() {
                            this.treePanel.getSelectionModel().clearSelections();
                            this.getLayout().setActiveItem(this.getId() + '-chooser');
                            //this.doLayout();
                        },
                        scope: this
                    }
                });
                this.getLayout().setActiveItem(this.getId() + 'editing_panel');
                this.doLayout();
                panel.loadFromRecord();
            },
            failure: function() {
                alert("Sorry for inconvenience. A problem occurred during load of records.");
            },
            scope: this
        });
    }

});

Ext.reg('studio.chooser', Studio.Chooser);
