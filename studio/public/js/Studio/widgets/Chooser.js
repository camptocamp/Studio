/*
 * Copyright (C) 2010  Camptocamp
 *
 * This file is part of Studio
 *
 * Studio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Studio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Studio.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.namespace('Studio');

Studio.Chooser = Ext.extend(Ext.Panel, {
    /**
     * APIProperty: subPanelXType
     * {String} The xtype of the panel created when a node is selected
     * in the tree. To be overriden in subclasses.
     */
    subPanelXType: null,

    /**
     * APIProperty: allowDelete
     * {Boolean} Specifies if nodes include a "delete" action. To be
     * overriden in subclasses. Defaults to true.
     */
    allowDelete: true,

    /**
     * APIProperty: allowExport
     * {Boolean} Specifies if nodes include an "export" action. To be
     * overriden in subclasses. Defaults to true.
     */
    allowExport: true,

    /**
     * APIProperty: allowCreateNew
     * {Boolean} Specifies if the tree includes a "create new" node. To
     * be overriden in subclasses. Defaults to true.
     */
    allowCreateNew: true,

    /**
     * APIProperty: storeType
     * {<Studio.data.Store>} The store to be used by this panel.
     */
    storeType: null,

    /**
     * APIProperty: label
     * {String} String representing the type of object managed by this panel.
     */
    label: null,

    /**
     * APIProperty: labels
     * {String} String used for the text of the root node.
     */
    labels: null,

    /**
     * APIProperty: textField
     * {String} The name of the record text field. Defaults to "name".
     */
    textField: "name",

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

    /**
     * Method: createChooserPanel
     */
    createChooserPanel: function() {

        // create the node ui for the "regular" nodes
        var actions = [];
        if (this.allowExport) {
            actions.push({
                action: "save",
                qtip: OpenLayers.i18n("export" + this.label)
            });
        }
        if (this.allowDelete) {
            actions.push({
                action: "delete",
                qtip: OpenLayers.i18n("delete" + this.label)
            });
        }
        var ElemNodeUI = Ext.extend(Ext.tree.ActionsNodeUI, {
            actions: actions
        });

        // create the "create new" node if necessary
        var children = [];
        if (this.allowCreateNew) {
            children.push({
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
            });
        }

        // create the tree panel
        var treePanel = this.treePanel = new Ext.tree.TreePanel({
            rootVisible: true,
            width: 300,
            border: false,
            root: new Ext.tree.AsyncTreeNode({
                text: this.labels,
                expanded: true,
                children: children
            }),
            loader: new Ext.tree.TreeLoader({
                uiProviders: {
                    'elem': ElemNodeUI
                }
            })
        });

        // register listeners
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
            if (action == "save") {
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
