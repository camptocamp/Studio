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

Studio.MapfileMgr.ClassPropertiesPanel = Ext.extend(Studio.MapfileMgr.MapfileForm, {

    title: OpenLayers.i18n('CLASS object properties'),

    autoScroll: true,

    /**
     * APIProperty: map
     * {OpenLayers.Map} the map
     */
    map: null,

    /**
     * APIProperty: geometryType
     *
     * One of 'polygon', 'line', 'point' or 'annotation'.
     */
    geometryType: null,

    /**
     * APIProperty: layer
     * The Mapfile layer being edited
     * {Object}
     */
    layer: null,

    createAddButton: function(clazz, opts) {
        return OpenLayers.Util.extend({
            handler: function() {
                var style = new clazz({mapfileInterface: this.mapfileInterface, geometryType: this.geometryType});
                var panel = this.addStylePanel(style);

                this.doLayout();
                this.doLayout(); //have to do it twice for style fieldsets
                panel.getEl().scrollIntoView(this.body);
                style.getEl().fadeIn({duration: 1});
                panel.getEl().highlight();
            },
            scope: this
        }, opts);
    },

    initComponent: function() {
        this.geometryType = this.layer.type;
        var labelWidth = 60;

        var bbarItems = [];

        if (this.geometryType == 'line' || this.geometryType == 'polygon') {
            bbarItems.push(this.createAddButton(Studio.MapfileMgr.StrokeStylePanel, {
                text: OpenLayers.i18n('Add Stroke'),
                iconCls: 'add',
                tooltip: OpenLayers.i18n('Add a Stroke style')
            }));
        }
        if (this.geometryType == 'polygon') {
            bbarItems.push(this.createAddButton(Studio.MapfileMgr.FillStylePanel, {
                text: OpenLayers.i18n('Add Fill'),
                iconCls: 'add',
                tooltip: OpenLayers.i18n('Add a Fill style')
            }));
        }
        if (this.geometryType == 'point' || this.geometryType == 'annotation') {
            bbarItems.push(this.createAddButton(Studio.MapfileMgr.PointStylePanel, {
                text: OpenLayers.i18n('Add Point'),
                iconCls: 'add',
                tooltip: OpenLayers.i18n('Add a Point style')
            }));
        }

        this.bbar = new Ext.Toolbar({
            items: bbarItems
        });

        this.items = [{
            layout: 'table',
            id: this.getId() + "_table",
            border: false,
            layoutConfig: {
                columns: 2
            },
            cls: "studioMaxTable",
            defaults: {
                // applied to each contained panel
                columnWidth: .5,
                labelWidth: labelWidth
            },
            items: [{
                layout: 'form',
                colspan: 2,
                border: false,
                items: [{
                    xtype: 'textfield',
                    id: this.getId() + '_name',
                    fieldLabel: OpenLayers.i18n('Name'),
                    name: 'name',
                    listeners: {
                        valid: function(field) {
                            var  f = getFormPanel(this);
                            if (f) {
                                f.fireEvent('namechange', this, this.getValue());
                            }
                        }
                    }
                }]
            },{
                xtype: 'fieldset',
                title: OpenLayers.i18n('Limit by scale'),
                collapsed: true,
                checkboxToggle: true,
                height: 120,
                items: [{
                    xtype: 'studio.mm.limitbyscale',
                    map: this.map
                }],
                listeners: {
                    scope: this,
                    expand: function(p) { this.fireEvent('change'); },
                    collapse: function(p) { this.fireEvent('change'); }
                }
            },{
                xtype: 'fieldset',
                title: OpenLayers.i18n('Limit by condition'),
                collapsed: true,
                checkboxToggle: true,
                height: 120,
                items: [{
                    xtype: 'studio.mm.limitbycondition',
                    layer: this.layer
                }],
                listeners: {
                    scope: this,
                    expand: function(p) { this.fireEvent('change'); },
                    collapse: function(p) { this.fireEvent('change'); }
                }
            },{
                xtype: 'fieldset',
                title: OpenLayers.i18n('Labels'),
                collapsed: true,
                checkboxToggle: true,
                autoHeight: true,
                colspan: 2,
                items: [{
                    border: false,
                    xtype: 'studio.mm.labelstyle',
                    mapfileInterface: this.mapfileInterface,
                    geometryType: this.geometryType
                }],
                listeners: {
                    scope: this,
                    expand: function(p) { this.fireEvent('change'); },
                    collapse: function(p) { this.fireEvent('change'); }
                }
            },{
                //looks like we cannot add/remove items in a table layout. So we
                //have to put the variable elements in something else.
                layout: 'anchor',
                id: this.getId() + "_styles",
                border: false,
                colspan: 2,
                defaults: {
                    anchor: '100%'
                },
                items: [/*Where the styles are going to be*/]
            }]
        }];

        this.on("resize", function(self) {
            //I don't know why, but without that, the style fieldsets are not being
            //resized when the container is resized
            self.doLayout();
        });

        Studio.MapfileMgr.ClassPropertiesPanel.superclass.initComponent.apply(this, arguments);
    },

    addStylePanel: function(stylePanel) {
        var styles = this.getStyles();
        var selfId = this.getId();
        var styleId = stylePanel.getId();

        var buttons = [
            '<a id="' + styleId + '_moveUp" href="javascript:Studio.MapfileMgr.ClassPropertiesPanel.doStyleAction(\'' + selfId + '\', \'' + styleId + '\', \'moveUp\')"><img class="col-move-bottom" src="' + Ext.BLANK_IMAGE_URL + '" /></a>',
            '<a id="' + styleId + '_moveDown" href="javascript:Studio.MapfileMgr.ClassPropertiesPanel.doStyleAction(\'' + selfId + '\', \'' + styleId + '\', \'moveDown\')"><img class="col-move-top" src="' + Ext.BLANK_IMAGE_URL + '" /></a>',
            '<a id="' + styleId + '_delete" href="javascript:Studio.MapfileMgr.ClassPropertiesPanel.doStyleAction(\'' + selfId + '\', \'' + styleId + '\', \'delete\')"><img src="images/panel-close.gif" /></a>'
        ];

        var result = styles.add({
            xtype: 'fieldset',
            id: styleId + '_fieldset',
            title: '<span class="studioStyleButtons">' + buttons.join('') + '</span>' + stylePanel.kind,
            autoHeight: true,
            items: [stylePanel]
        });
        stylePanel.on('render', this.updateStyleButtons, this);
        return result;
    },

    /**
     * Method: updateStyleButtons
     *
     * Update the moveUp and moveDown in function of the styles' positions.
     */
    updateStyleButtons: function() {
        var styles = this.getStyles();
        var lastI = styles.items.getCount() - 1;
        for (var i = 0; i <= lastI; ++i) {
            var styleId = styles.items.get(i).getId().replace('_fieldset', '');
            var moveUp = Ext.get(styleId + '_moveUp');
            var moveDown = Ext.get(styleId + '_moveDown');
            if (moveUp) {
                moveUp.setDisplayed(i != 0);
            }
            if (moveDown) {
                moveDown.setDisplayed(i != lastI);
            }
        }
    },

    /**
     * Method: removeStylePanels
     * Remove all the styles
     */
    removeStylePanels: function() {
        this.getStyles().removeAll();
    },

    /**
     * Method: moveUpStyle
     * Move a style up in the list
     *
     * Parameters:
     * styleFieldSet - {Ext.FieldSet} the fieldset with the style to move.
     */
    moveUpStyle: function(styleFieldSet) {
        var styles = this.getStyles();
        var pos = styles.items.indexOf(styleFieldSet);
        if (pos < 1) return;
        var previous = styles.items.get(pos - 1);

        //move it in Ext
        styles.items.removeAt(pos);
        styles.items.insert(pos - 1, styleFieldSet);

        //and move it in DOM
        styleFieldSet.getEl().insertBefore(previous.getEl());
        this.updateStyleButtons();
        this.doLayout();
        styleFieldSet.getEl().scrollIntoView(this.body);
        styleFieldSet.getEl().highlight();
        this.fireEvent('change');
    },

    /**
     * Method: moveDownStyle
     * Move a style down in the list
     *
     * Parameters:
     * styleFieldSet - {Ext.FieldSet} the fieldset with the style to move.
     */
    moveDownStyle: function(styleFieldSet) {
        var styles = this.getStyles();
        var pos = styles.items.indexOf(styleFieldSet);
        if (pos + 1 >= styles.items.getCount()) return;
        var next = styles.items.get(pos + 1);

        //move it in Ext
        styles.items.removeAt(pos);
        styles.items.insert(pos + 1, styleFieldSet);

        //and move it in DOM
        styleFieldSet.getEl().insertAfter(next.getEl());
        this.updateStyleButtons();
        this.doLayout();
        styleFieldSet.getEl().scrollIntoView(this.body);
        styleFieldSet.getEl().highlight();
        this.fireEvent('change');
    },

    /**
     * Method: deleteStyle
     * Delete a style
     *
     * Parameters:
     * styleFieldSet - {Ext.FieldSet} the fieldset with the style to delete.
     */
    deleteStyle: function(styleFieldSet) {
        styleFieldSet.getEl().fadeOut({
            callback: function() {
                this.getStyles().remove(styleFieldSet);
                this.updateStyleButtons();
                this.doLayout();
            },
            scope: this
        });
        this.fireEvent('change');
    },

    getStyles: function() {
        if (!this.styles) {
            this.styles = Ext.getCmp(this.getId() + "_styles");
        }
        return this.styles;
    }

});

Studio.MapfileMgr.ClassPropertiesPanel.doStyleAction = function(classId, styleId, actionName) {
    var clazz = Ext.getCmp(classId);
    var styleFieldSet = Ext.getCmp(styleId + '_fieldset');
    clazz[actionName + 'Style'].call(clazz, styleFieldSet);
};

Ext.reg('studio.mm.classpropertiespanel', Studio.MapfileMgr.ClassPropertiesPanel);
