Ext.namespace('Studio');

Studio.Chooser = Ext.extend(Ext.Panel, {
    /**
     */
    subPanelXType: null,

    layout: "card",

    /**
     */
    storeType: null,

    /**
     */
    label: null,

    /**
     */
    labels: null,

    /**
     */
    textField: 'name',

    /**
     * Property: treePanel
     * {Ext.tree.TreePanel} The tree panel.
     */
    treePanel: null,
    
    /**
     * Property: layout
     * {String} The layout of this panel.
     */
    layout: "card",

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

        var actions = this.elementNodeUIActions || [{
            action: 'script_save',
            qtip: OpenLayers.i18n('export' + this.label)
        },{
            action: 'delete',
            qtip: OpenLayers.i18n('delete' + this.label)
        }];

        var elemNodeUI = Ext.extend(Ext.tree.ActionsNodeUI, {
            actions: actions
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

    /**
     * Method: elemListTreeOnBeforeSelect
     * Callback function called before a node is selected in the tree. 
     *
     * Parameters:
     * sm - {Ext.tree.DefaultSelectionModel} The tree selection model.
     * node - {Ext.tree.TreeNode} The tree node.
     */
    elemListTreeOnBeforeSelect: function(sm, node) {
    },

    /**
     * Method: elemListTreeOnSelect
     * Callback function called when a node is selected in the tree.
     * If the selected node is a "regular" node this function loads
     * the information about that node from the server.
     *
     * Parameters:
     * sm - {Ext.tree.DefaultSelectionModel} The tree selection model.
     * node - {Ext.tree.TreeNode} The tree node.
     */
    elemListTreeOnSelect: function(sm, node) {
        if (node && node.attributes.role == 'elem') {
            this.loadRecord(node.attributes.record, node);
        }
    },

    /**
     * Method: loadRecord
     * Get information from the server about a record, and display the
     * "editing panel" upon the reception of that information.
     *
     * Parameters:
     * record - {Ext.data.Record} The record.
     * node {Ext.tree.TreeNode} The associated tree node.
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
                        },
                        scope: this
                    }
                });
                this.getLayout().setActiveItem(this.getId() + 'editing_panel');
                this.doLayout();
                panel.loadFromRecord();
            },
            failure: function() {
                alert("A problem occured, check your connection to the server.");
            },
            scope: this
        });
    }

});

Ext.reg('studio.chooser', Studio.Chooser);
