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

Studio.MapfileMgr.StyleWizard = Ext.extend(Ext.Window, {

    /**
     * Property: layer
     * The currently selected Layer
     * {Object}
     */
    layer: null,

    /**
     * APIProperty: mapfileInterface
     * The currently selected MapFileInterface
     * {Studio.interface.MapfileInterface}
     */
    mapfileInterface: null,

    /**
     * Property: properties
     * all the style properties
     */
    properties: null,

    title: OpenLayers.i18n('Style Wizard'),
    layout: 'fit',
    modal: true,
    border: false,
    width: 800,
    height: 600,

    initComponent: function() {
        this.addEvents({
            /**
             * Event fired when the styles are ready
             */
            styleready: true
        });

        this.bbar = ['->', {
            id: this.getId() + '_apply_button',
            text: OpenLayers.i18n('Apply'),
            disabled: false,
            handler: function() {
                this.addStyleToAllClasses(this.layer);
                this.fireEvent('styleready', this, this.layer);
            },
            scope: this
        },{
            text: OpenLayers.i18n('Cancel'),
            handler: function() {
                this.close();
            },
            scope: this
        }];

        this.items = new Ext.form.FormPanel({
            id: this.getId() + '_formpanel',
            defaults: {
                bodyStyle: "padding:5px;",
                border: false,
                layout: 'form'
            },
            items: [
                {
                    id: this.getId() + '_classes',
                    region: 'center',
                    items: [
                        {
                            xtype: 'combo',
                            fieldLabel:  OpenLayers.i18n('Update mode: '),
                            labelWidth: 300,
                            width: 300,
                            editable: false,
                            typeAhead: false,
                            emptyText: OpenLayers.i18n('Select an update mode'),
                            mode: 'local',
                            triggerAction: 'all',
                            forceSelection: true,
                            listeners: {
                                select: this.selectMode,
                                scope: this
                            },
                            store: [
                                ['Update',OpenLayers.i18n('Update existing classes')],
                                ['Add',OpenLayers.i18n('Add new classes')]
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            id: this.getId() + "_label_panel_fieldset",
                            title: OpenLayers.i18n('Label'),
                            hidden: true,
                            autoHeight: true,
                            items: [
                                {
                                    xtype: 'studio.mm.labelstyle',
                                    mapfileInterface: this.mapfileInterface,
                                    id: this.getId() + "_label_panel"
                                }
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            id: this.getId() + "_stroke_panel_fieldset",
                            title: OpenLayers.i18n('Stroke'),
                            hidden: true,
                            autoHeight: true,
                            items: [
                                {
                                    xtype: 'studio.mm.strokestyle',
                                    mapfileInterface: this.mapfileInterface,
                                    id: this.getId() + "_stroke_panel"
                                }
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            id: this.getId() + "_point_panel_fieldset",
                            title: OpenLayers.i18n('Point'),
                            hidden: true,
                            autoHeight: true,
                            items: [
                                {
                                    xtype: 'studio.mm.pointstyle',
                                    mapfileInterface: this.mapfileInterface,
                                    id: this.getId() + "_point_panel"
                                }
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            id: this.getId() + "_fill_panel_fieldset",
                            title: OpenLayers.i18n('Fill'),
                            hidden: true,
                            autoHeight: true,
                            items: [
                                {
                                    xtype: 'studio.mm.fillstyle',
                                    mapfileInterface: this.mapfileInterface,
                                    id: this.getId() + "_fill_panel"
                                }
                            ]
                        }
                    ]

                }
            ]
        });

        Studio.MapfileMgr.StyleWizard.superclass.initComponent.apply(this, arguments);
    },

    selectMode: function(combo, record, index) {
        var strokePanelFieldset = Ext.getCmp(this.getId() + "_stroke_panel_fieldset");
        var labelPanelFieldset = Ext.getCmp(this.getId() + "_label_panel_fieldset");
        var pointPanelFieldset = Ext.getCmp(this.getId() + "_point_panel_fieldset");
        var fillPanelFieldset = Ext.getCmp(this.getId() + "_fill_panel_fieldset");
        labelPanelFieldset.show();
        if (this.layer.attributes.properties.type == 'line' || this.layer.attributes.properties.type == 'polygon') {
            strokePanelFieldset.show();
        }
        if (this.layer.attributes.properties.type == 'polygon') {
            fillPanelFieldset.show();
        }
        if (this.layer.attributes.properties.type == 'point' || this.layer.attributes.properties.type == 'annotation') {
            pointPanelFieldset.show();
        }
        this.doLayout();
        this.doLayout();
    },

    getClasses: function(layerNode) {
        var classList = '';
        var i = 0;
        for (i = 0; i < layerNode.childNodes.length; i++) {
            var childnode = layerNode.childNodes[i];
            if (childnode.attributes.role == 'class') {
                classList = classList + '"' + childnode.attributes.properties.name + '" ';
            }
        }
        return classList;
    },

    getStyleCount: function(layerNode, className) {
        var i = 0;
        for (i = 0; i < layerNode.childNodes.length; i++) {
            var childnode = layerNode.childNodes[i];
            if (childnode.attributes.role == 'class') {
                if (childnode.attributes.properties.name == className) {
                    return childnode.attributes.properties.styles.length;
                }
            }
        }
    },
    // add a new style to all classes
    addStyleToAllClasses: function(layerNode) {
        var i = 0;
        var style = {
            color: [122,122,122],
            size: 3
        };
        for (i = 0; i < layerNode.childNodes.length; i++) {
            var childnode = layerNode.childNodes[i];
            if (childnode.attributes.role != 'class') {
                // Bug in equality
            } else {
                childnode.attributes.properties.styles.push(style);
            }
        }
    }
});
