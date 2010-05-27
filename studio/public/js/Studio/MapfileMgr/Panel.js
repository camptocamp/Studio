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

Ext.namespace('Studio', 'Studio.MapfileMgr');

Studio.MapfileMgr.Panel = Ext.extend(Ext.Panel, {

    layout: 'border',

    defaults: {
        border: false
    },

    /**
     * APIProperty: currentRecordInterface
     * The currently selected Mapfile interface
     * {Studio.interface.MapfileInterface}
     */
    currentRecordInterface: null,

    /**
     * APIProperty: node
     * The Chooser's node
     */
    node: null,

    /**
     * Property: tree
     */
    tree: null,
    
    /**
     * Property: currentPanelProperties
     */
    currentPanelProperties: null,

    /**
     * Property: map
     * {OpenLayers.Map}
     */
    map: null,

    /**
     * Property: mapfileLayer
     * The OL layer showing the current mapfile
     * {OpenLayers.Layer.WMS}
     */
    mapfileLayer: null,

    /**
     * Property: dirty
     * true if the mapfile has been modified and has to be saved
     */
    dirty: false,

    /**
     * APIProperty: record
     * The JSON mapfile
     */
    record: null,

    /**
     * Method: initComponent
     * Initialize the Mapfile Manager Panel.
     */
    initComponent : function() {
        this.buildMapfileTree();

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
                    this.tree,
                    this.getMapViewerPanel()
                ]
            }]
        },
            this.getPropertiesPanel()
        ];

        this.tbar = [{
            text: OpenLayers.i18n('<-- Back to mapfiles list'),
            handler: function() {
                var backToMapfilesList = function() {
                    if (this.map) {
                        this.map.destroy();
                        this.map = null;
                    }
                    this.destroy();
                };

                if (this.dirty) {
                    Ext.Msg.confirm(OpenLayers.i18n('Attention'),
                    		OpenLayers.i18n('There are unsaved changes !<br /> Are you sure you want to switch to another mapfile ?<br /> '),
                            function(btn) {
                                if (btn == 'yes') {
                                    backToMapfilesList.call(this);
                                }
                            },
                            this // scope
                            );
                } else {
                    backToMapfilesList.call(this);
                }
            },
            scope: this
        },'-',{
            id: this.getId() + '_save_button',
            text: OpenLayers.i18n('Save mapfile'),
            iconCls: 'save',
            disabled: true,
            handler: this.saveMapfile,
            scope: this
        }];

        Studio.MapfileMgr.Panel.superclass.initComponent.call(this);
    },

    loadFromRecord: function() {
        this.tree.getLoader().doPreload(this.tree.getRootNode());
        //TODO: update the up down button on the classes

        this.populateMapfileTree(this.record);

        // don't create the map is there's not at least one layer saved
        if (this.record.layers.length > 0) {
            this.createMap();
        }

        // TODO this one causes problems because "change" events are fired
        //this.tree.root.findChild('role', 'mapfile').select();

        //OK, we changed the tree, but that doesn't mean we changed the mapfile, this time
        Ext.getCmp(this.getId() + '_save_button').disable();
        this.dirty = false;
    },

    updateMapLayers: function() {
        if (!this.map) {
            this.createMap();
        }

        var mapfileLayers = this.getLayersList();

        if (!this.mapfileLayer && mapfileLayers.length > 0) {
            var layer = new OpenLayers.Layer.WMS(
                    "baselayer",
                    this.currentRecordInterface.getWMSProxy(),
            {
                layers: mapfileLayers,
                format:'image/png'
            }, {
                singleTile:true,
                ratio: 1,
                transitionEffect:'resize'
            });
            this.map.addLayer(layer);
            this.mapfileLayer = layer;
            this.map.zoomToMaxExtent();
        }
    },

    getMapViewerPanel:function() {
        return {
            title: OpenLayers.i18n('Map Viewer'),
            id: this.getId() + '_viewerContainer',
            region: 'south',
            height: 300,
            layout: 'fit',
            split: true,
            disabled: true,
            tools:[{
                id:'refresh',
                scope: this,
                qtip: OpenLayers.i18n('Save mapfile and refresh map'),
                handler: function(event, toolEl, panel) {
                    this.saveMapfile();
                }
            },{
                id:'maximize',
                scope: this,
                qtip: OpenLayers.i18n('Show a bigger map'),
                handler: function(event, toolEl, panel) {
                    toolEl.hide();
                    panel.tools['minimize'].show();
                    this.setMapViewSize(700, 500);
                }
            },{
                id:'minimize',
                scope: this,
                hidden: true,
                qtip: OpenLayers.i18n('Show a smaller map'),
                handler: function(event, toolEl, panel) {
                    toolEl.hide();
                    panel.tools['maximize'].show();
                    this.setMapViewSize(400, 300);
                }
            }],
            bbar: [new Ext.form.Checkbox({
                id: this.getId() + 'display_selected_only',
                checked: false,
                boxLabel: '<span style="color:#EEEEF0;">'+OpenLayers.i18n('Display selected layer')+'<span>',
                listeners: {
                    check: this.refreshMap,
                    scope: this
                }
            })]
        };
    },

    createMap: function() {
        if (!this.map) {
            this.map = new OpenLayers.Map();
            this.map.addControl(new OpenLayers.Control.Scale());

        }

        if (!Ext.getCmp(this.getId() + 'map_viewer_panel')) {
            var vC = Ext.getCmp(this.getId() + '_viewerContainer');
            vC.add({
                xtype: "gx_mappanel",
                id: this.getId() + 'map_viewer_panel',
                map: this.map
            });
            vC.ownerCt.doLayout();
        } else {
            Ext.getCmp(this.getId() + 'map_viewer_panel').map = this.map;
        }

        this.updateMapLayers();
        Ext.getCmp(this.getId() + '_viewerContainer').enable();
    },

    /**
     * Method: buildMapfileTree
     * Builds the mapfile tree
     */
    buildMapfileTree: function() {
        var LayerNodeUI = Ext.extend(Ext.tree.ActionsNodeUI, {
            actions: [{
                action: 'layertemplate',
                qtip: OpenLayers.i18n('Save as layer template')
            },{
                action: 'classify',
                qtip: OpenLayers.i18n('classify using wizard'),
                hide: function() {
                    return this.attributes.properties.type == 'raster';
                }
            },{
                action: 'addStyle',
                qtip: OpenLayers.i18n('add a style to all classes'),
                hide: function() {
                    return this.attributes.properties.type == 'raster';
                }
            },{
                action: 'move-up',
                qtip: OpenLayers.i18n('move up this layer'),
                hide: function() {
                    return this.isFirst();
                }
            },{
                action: 'move-down',
                qtip: OpenLayers.i18n('move down this layer'),
                hide: function() {
                    var parent = this.parentNode;
                    return parent.indexOf(this) ==
                           parent.indexOf(parent.findChild('role', 'new-layer')) - 1;
                }
            },{
                action: 'delete',
                qtip: OpenLayers.i18n('delete layer')
            }]
        });

        var ClassNodeUI = Ext.extend(Ext.tree.ActionsNodeUI, {
            actions: [{
                action: 'move-up',
                qtip: OpenLayers.i18n('move up class'),
                hide: function() {
                    return this.isFirst();
                }
            },{
                action: 'move-down',
                qtip: OpenLayers.i18n('move down class'),
                hide: function() {
                    var parent = this.parentNode;
                    return parent.indexOf(this) ==
                           parent.indexOf(parent.findChild('role', 'new-class')) - 1;
                }
            },{
                action: 'delete',
                qtip: OpenLayers.i18n('delete class')
            }]
        });

        // add the fake node for new layer create action
        var newLayerNode = {
            text: OpenLayers.i18n('create new layer ...'),
            cls: "add-txt",
            iconCls: "add",
            leaf: true,
            getLayerName: function() {
                return null;
            },
            role: 'new-layer'
        };

        // mapfileProp object must contain every property from mapfile object
        // except layers property
        var mapfileProp = {};
        for (var property in this.record) {
            if (property != 'layers') {
                mapfileProp[property] = this.record[property];
            }
        }

        this.tree = new Ext.tree.TreePanel({
            id: 'mapfile-tree',
            region: 'center',
            rootVisible: false,
            autoScroll: true,
            singleExpand: true,
            root: new Ext.tree.AsyncTreeNode({
                text: 'invisible root node',
                role: 'mapfile-root',
                children: [{
                    text: OpenLayers.i18n('global properties'),
                    leaf: true,
                    getLayerName: function() {
                        return null;
                    },
                    role: 'record',
                    properties: mapfileProp
                }, {
                    text: OpenLayers.i18n('layers'),
                    getLayerName: function() {
                        return null;
                    },
                    role: "layers-root",
                    expanded: true,
                    children: [newLayerNode]
                }]
            }),
            loader: new Ext.tree.TreeLoader({
                preloadChildren: true, // set to true unless parseMapfileTree doesn't parse collapsed nodes
                uiProviders: {
                    'layer': LayerNodeUI,
                    'class': ClassNodeUI
                }
            })
        });

        this.tree.getSelectionModel().on('beforeselect', this.mapfileTreeOnBeforeSelect, this);
        this.tree.getSelectionModel().on('selectionchange', this.mapfileTreeOnSelect, this);
        this.tree.on('action', this.treeOnAction, this);  // TODO consistence in methods naming
        this.tree.on('movenode', this.onPropertyChange, this);
        this.tree.on('remove', this.onPropertyChange, this);
    },

    populateMapfileTree: function(mapfile) {
        var lenI = mapfile.layers.length;
        for (var i = 0; i < lenI; i++) {
            var l = mapfile.layers[i];
            this.addLayer(l);
        }
    },

    /**
     * APIMethod: addLayer
     * Adds a new layer node
     *
     * Parameters:
     * properties {Object} - config object for the new node
     *
     * Returns:
     * newNode {Ext.tree.TreeNode} the created node
     */
    addLayer: function(properties) {
        // layerProp object must contain every property from layer object
        // except classes property
        var layerProp = {};
        for (var property in properties) {
            if (property != 'classes') {
                layerProp[property] = properties[property];
            }
        }

        // write the projection in mapfile global properties if it doesn't exist yet
        var globalPropertiesNode = this.tree.root.findChild('role', 'record');
        if ((!globalPropertiesNode.attributes.properties.projection) && layerProp.projection) {
            globalPropertiesNode.attributes.properties.projection = layerProp.projection;
        }

        var layersRootNode = this.tree.root.findChild('role', 'layers-root');
        var node = layersRootNode.findChild('role', 'new-layer');

        var isRaster = properties.type == 'raster';

        var layerNode = layersRootNode.insertBefore({
            text: properties.name,
            leaf: isRaster,
            getLayerName: function() {
                return this.attributes.properties.name;
            },
            role: 'layer',
            properties: layerProp,
            uiProvider: 'layer'
        }, node);

        if (!isRaster) {
            var classes = properties.classes || [];
            this.addClasses(layerNode, classes, false);

            // mark the layer node as loaded so that it doesn't try to load when expanded
            layerNode.loaded = true;
        }

        if (!layerNode.isFirst()) {
            layerNode.previousSibling.ui.updateActions(layerNode.previousSibling);
        }

        return layerNode;
    },

    /**
     * APIMethod: addClass
     * Adds a new class node, can be either by clicking on the "create new class" button
     *      or called by the classification wizard
     *
     * Parameters:
     * layerNode {Ext.tree.TreeNode} - the layer node to add the class to
     * properties {Object} - config object for the new node
     *
     * Returns:
     * newNode {Ext.tree.TreeNode} the created node
     */
    addClass: function(layerNode, properties) {
        var node = layerNode.findChild('role', 'new-class');

        var newNode = layerNode.insertBefore({
            text: properties.name,
            leaf: true,
            getLayerName: function() {
                return this.parentNode.attributes.properties.name;
            },
            role: 'class',
            properties: properties,
            uiProvider: 'class'
        }, node);

        if (!newNode.isFirst()) {
            newNode.previousSibling.ui.updateActions(newNode.previousSibling);
        }

        return newNode;
    },

    /**
     * APIMethod : addClasses
     * Adds new classes
     *
     * Parameters
     * layerNode {Ext.tree.TreeNode} - the layer node to add the class to
     * classes {Array} - array of classes properties
     * append {Boolean} tells if the new classes should be appended, defaults to true
     */
    addClasses: function(layerNode, classes, append) {
        if (append == null) {
            append = true;
        }

        if (!append) {

            //remove all the childs
            while (layerNode.item(0)) {
                layerNode.item(0).remove();
            }

            // add the fake node for new class create action
            layerNode.appendChild({
                text: OpenLayers.i18n('create new class ...'),
                cls: "add-txt",
                iconCls: "add",
                leaf: true,
                getLayerName: function() {
                    return this.parentNode.attributes.properties.name;
                },
                role: 'new-class'
            });
        }

        Ext.each(classes, function(clazz, index) {
            clazz.name = clazz.name || "class " + index;
            this.addClass(layerNode, clazz);
        }, this);
    },

    mapfileTreeOnSelect: function(sm, node) {
        // clear the panel
        this.propertiesPanel.removeAll();
        if (!node) return;

        this.refreshMap(false);

        var properties = node.attributes;

        this.currentPanelProperties = null;

        switch (properties.roles) {
            case 'record':
            case 'layers-root':
            case 'layer':
            case 'class':
                this.refreshMap();
                break;
        }

        switch (properties.role) {
            case 'record':
                this.currentPanelProperties = new Studio.MapfileMgr.MapPropertiesPanel({
                    mapfileInterface: this.currentRecordInterface,
                    properties: properties.properties
                });
                this.propertiesPanel.add(this.currentPanelProperties);
                this.propertiesPanel.doLayout();
                this.currentPanelProperties.loadData();
                break;

            case 'layers-root':
                break;

            case 'layer':
                this.currentPanelProperties = new Studio.MapfileMgr.LayerPropertiesPanel({
                    mapfileInterface: this.currentRecordInterface,
                    properties: properties.properties,
                    map: this.map
                });
                this.propertiesPanel.add(this.currentPanelProperties);
                this.propertiesPanel.doLayout();
                this.currentPanelProperties.loadData();
                break;

            case 'new-layer':
                var win = new Studio.MapfileMgr.AddLayerWindow({
                     layers: this.record.layers
                });
                win.on('layercreated',
                        function(obj) {
                            this.addLayer(obj);
                            this.saveMapfile();
                        },
                        this);
                win.show();
                this.tree.getSelectionModel().clearSelections();
                break;

            case 'class':
                this.currentPanelProperties = new Studio.MapfileMgr.ClassPropertiesPanel({
                    mapfileInterface: this.currentRecordInterface,
                    layer: node.parentNode.attributes.properties,
                    properties: properties.properties,
                    map: this.map
                });
                this.propertiesPanel.add(this.currentPanelProperties);
                this.propertiesPanel.doLayout();
                this.currentPanelProperties.loadData();
                break;

            case 'new-class':
                var newNode = this.addClass(node.parentNode, {name: OpenLayers.i18n('New class')});
                newNode.select();
                break;

            default:
                alert('error: unsupported node type: ' + properties.role);
                break;
        }
        
        if (this.currentPanelProperties) {
            this.currentPanelProperties.on({
                'change': function(field, newValue, oldValue) {
                    this.onPropertyChange();
                },
                namechange: function(field, value) {
                    sm = this.tree.getSelectionModel();
                    node = sm.getSelectedNode();
                    node.setText(value);
                },
                scope: this
            });
        }
    },

    mapfileTreeOnBeforeSelect: function(sm, newSelNode, oldSelNode) {
        this.pushPropertiesToTree();
    },

    pushPropertiesToTree: function () {
        // FIXME: test if currentPanelProperties needs to be saved (if it has been modified)
        var sm = this.tree.getSelectionModel();
        var node = sm.getSelectedNode();

        if ((this.currentPanelProperties != null) && (node != null)) {
            node.attributes.properties = this.currentPanelProperties.getData();
        }
    },

    treeOnAction: function(node, action, e) {
        var properties = node.attributes;
        var parentNode = node.parentNode;

        switch (properties.role) {
            case 'layer':
                switch (action) {
                    case 'delete':
                    	Ext.MessageBox.confirm(OpenLayers.i18n('Delete confirmation'), OpenLayers.i18n('Are you sure that you want to delete this layer ?'), function(btn){
                    		if (btn == 'yes') {
                    			var updateNode = null;
                                if (parentNode.indexOf(node) ===
                                    (parentNode.indexOf(parentNode.findChild('role', 'new-layer')) - 1)) {
                                    updateNode = node.previousSibling;
                                }
                                else if (node.isFirst()) {
                                    updateNode = node.nextSibling;
                                }
                                node.remove();
                                if (updateNode !== null) {
                                    updateNode.ui.updateActions(updateNode);
                                }
                    		}
                    		else{
                    			return false;
                    		}

                    	});
                        break;
                    case 'move-up':
                        if (!node.isFirst()) {
                            parentNode.insertBefore(node, node.previousSibling);
                            node.ui.updateActions(node);
                            node.nextSibling.ui.updateActions(node.nextSibling);
                        }
                        break;
                    case 'move-down':
                        if (parentNode.indexOf(node) <
                            parentNode.indexOf(parentNode.findChild('role', 'new-layer')) - 1) {
                            parentNode.insertBefore(node, node.nextSibling.nextSibling);
                            node.ui.updateActions(node);
                            node.previousSibling.ui.updateActions(node.previousSibling);
                        }
                        break;
                    case 'classify':
                        var win = new Studio.MapfileMgr.ClassificationWizard({
                            layer: node
                        });
                        win.show();
                        win.on('classificationready', function(win, layer, classes) {
                            this.addClasses(layer, classes, false);
                            this.onPropertyChange();
                            win.close();
                        }, this /* scope */);
                        break;
                    case 'addStyle':
                        var win = new Studio.MapfileMgr.StyleWizard({
                            layer: node,
                            mapfileInterface: this.currentRecordInterface
                        });
                        win.show();
                        win.on('styleready', function(win, layer) {
                            this.onPropertyChange();
                            win.close();
                        }, this /* scope */);
                        break;
                    case 'layertemplate':
                        //FIXME: Ensure layer properties is up to date (Save mapfile?)
                        var layer_properties = this.parseMapfileTree(node);
                        var win = new Studio.MapfileMgr.SaveLayertemplateWindow({
                            layer: layer_properties
                        });
                        win.show();
                        break;
                }
                break;

            case 'class':
                switch (action) {
                    case 'delete':
                        var updateNode = null;
                        if (parentNode.indexOf(node) ===
                            (parentNode.indexOf(parentNode.findChild('role', 'new-class')) - 1)) {
                            updateNode = node.previousSibling;
                        }
                        else if (node.isFirst()) {
                            updateNode = node.nextSibling;
                        }
                        node.remove();
                        if (updateNode !== null) {
                            updateNode.ui.updateActions(updateNode);
                        }
                        break;
                    case 'move-up':
                        if (!node.isFirst()) {
                            parentNode.insertBefore(node, node.previousSibling);
                            node.ui.updateActions(node);
                            node.nextSibling.ui.updateActions(node.nextSibling);
                        }
                        break;
                    case 'move-down':
                        var parent = node.parentNode;
                        if (parent.indexOf(node) <
                            parent.indexOf(parent.findChild('role', 'new-class')) - 1) {
                            parentNode.insertBefore(node, node.nextSibling.nextSibling);
                            node.ui.updateActions(node);
                            node.previousSibling.ui.updateActions(node.previousSibling);
                        }
                        break;
                }
                break;
        }
    },

    getPropertiesPanel: function() {
        this.propertiesPanel = new Ext.Panel({
            region: 'center',
            layout: 'fit',
            defaults: {
                border: false,
                bodyStyle: "padding: 5px"
            }
        });
        return this.propertiesPanel;
    },

    /**
     * Method: parseMapfileTree
     * Parse the mapfile tree from a specified node (or from root node if there is
     * not any node specified) and return a js object that represents the mapfile
     *
     * node {Ext.tree.TreeNode} beginning node from which tree is parsed.
     */
    parseMapfileTree: function(rootNode) {

        var parseNode = function (node) {
            var process_next_sibling = true;
            var properties = node.attributes.properties;
            var next;
            switch (node.attributes.role) {
                case 'mapfile-root':
                    next = node.firstChild;
                    if (next != null) {
                        parseNode.call(this, next);
                    }
                    break;

                case 'record':
                    for (property in properties) {
                        this[property] = properties[property];
                    }
                    break;

                case 'layers-root':
                    next = node.firstChild;
                    if (next != null) {
                        this.layers = new Array();
                        parseNode.call(this.layers, next);
                    }
                    break;

                case 'layer':
                    next = node.firstChild;
                    if (Ext.isArray(this)) {
                        var l = this.push(properties) - 1;
                        if (next != null) {
                            this[l].classes = new Array();
                            parseNode.call(this[l].classes, next);
                        }
                    }
                    else {
                        for (var property in properties) {
                            this[property] = properties[property];
                        }
                        if (next != null) {
                            this.classes = new Array();
                            parseNode.call(this.classes, next);
                        }
                        process_next_sibling = false;
                    }
                    break;

                case 'class':
                    if (Ext.isArray(this)) {
                        this.push(properties);
                    }
                    else {
                        for (property in properties) {
                            this[property] = properties[property];
                        }
                        process_next_sibling = false;
                    }
                    break;
            }

            if (process_next_sibling) {
                next = node.nextSibling;
                if (next != null) {
                    //TODO: make this iteration without recursion. It's impossible to save
                    //a mapfile with a lot of classes (around 200) because of that (too much recursion error).
                    parseNode.call(this, next);
                }
            }
        };

        var result = {};
        if (!rootNode) {
            rootNode = this.tree.getRootNode();
        }
        parseNode.call(result, rootNode);

        return result;
    },

    /**
     * Method: onPropertyChange
     * Is called when something has changed in the properties panel whatever it is (global, layer, class, ...)
     */
    onPropertyChange: function() {
        Ext.getCmp(this.getId() + '_save_button').enable();
        this.dirty = true;
    },

    /**
     * Method: saveMapfile
     * Updates the mapfile tree with modified values,
     *     calls the method to send the mapfile to server,
     *     enables or disables the save button,
     *     refreshes the map.
     */
    saveMapfile: function() {
        this.pushPropertiesToTree();

        var button = Ext.getCmp(this.getId() + '_save_button');
        button.disable();
        button.setText(OpenLayers.i18n('Saving ...'));

        var content = this.parseMapfileTree();
        this.currentRecordInterface.createOrUpdate({
            success: function() {
                button.setText(OpenLayers.i18n('Save mapfile'));
                this.refreshMap(true);
                this.dirty = false;
                Studio.mapfileStore.store.reload();
            },
            failure: function() {
                button.enable();
                button.setText(OpenLayers.i18n('Save mapfile'));
                var txt = ["An error occured while saving,",
                    "please report the problem."].join(" ");
                Ext.MessageBox.alert("Error", txt);
            },
            scope: this
        }, content);
    },

    /**
     * Method: getLayersList
     * Gets the layers list from the mapfileTree
     */
    getLayersList: function() {
        var layers = [];
        this.tree.getRootNode().cascade(function(node) {
            if (node.attributes.role == 'layer') {
                // TODO do we really need to specify the scope ?
                // As discussed with Bruno, it should probably be better if we consider having
                // classes such as LayerNode, ClassNode, etc ... extending TreeNode
                // and implementing a getLayerName method
                layers.push(node.attributes.getLayerName.call(node));
            }
        });
        return layers.join(',');
    },

    /**
     * Method: refreshMap
     * Refreshes the map (depends on which tree node is selected)
     *
     * forceReload {Boolean} true to force the map reload (ie. disable browser caching)
     */
    refreshMap: function(forceReload) {
        this.updateMapLayers();
        if (!this.mapfileLayer) return;

        var node = this.tree.getSelectionModel().getSelectedNode();
        var layerName = node ? node.attributes.getLayerName.call(node) : null;

        if (layerName != null &&
            Ext.getCmp(this.getId() + 'display_selected_only').checked) {
            this.mapfileLayer.params.LAYERS = layerName;
        } else {
            this.mapfileLayer.params.LAYERS = this.getLayersList();
        }

        this.mapfileLayer.redraw(forceReload);
    },

    /**
     *
     */
    setMapViewSize: function(width, height) {
        Ext.getCmp(this.getId() + '_viewerContainer').ownerCt.ownerCt.setWidth(width);
        Ext.getCmp(this.getId() + '_viewerContainer').setHeight(height);
        this.doLayout();
    }
});

Ext.reg('studio.mm.panel', Studio.MapfileMgr.Panel);

// Patch for Ext's comboboxes so that setValue works even if the store is not loaded yet.
// Taken and adapted (PVIzed) from:
//  http://extjs.com/learn/Ext_FAQ_ComboBox#Form_submits_displayField_instead_of_valueField
// Plus, I added an event that is trigged whenever the value is changed. No exception (I hope).
var prevExtFormComboBoxSetValue = Ext.form.ComboBox.prototype.setValue;
Ext.form.ComboBox.prototype.setValue = function(v) {
    if (this.store.getCount() == 0) {
        //store not yet loaded, will set the value when it's done.
        this.store.on('load', function() {
            if(this.store) { //why sometimes the store goes NULL? I don't know...
                prevExtFormComboBoxSetValue.call(this, v);
                this.fireEvent('selectpvi', this, v);
            }
        }, this, {single: true});
    } else {
        //store already loaded, normal behavior
        prevExtFormComboBoxSetValue.call(this, v);
        this.fireEvent('selectpvi', this, v);
    }
};

var prevExtFormComboBoxInitComponent = Ext.form.ComboBox.prototype.initComponent;
Ext.form.ComboBox.prototype.initComponent = function() {
    prevExtFormComboBoxInitComponent.apply(this, arguments);
    this.addEvents('selectpvi');
};
