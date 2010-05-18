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

Studio.MapfileMgr.AddLayerWindow = Ext.extend(Ext.Window, {

    title: OpenLayers.i18n('Add a LAYER'),
    layout: 'form',
    modal: true,
    width: 625,

     /**
     * Mapfile layers
     */
    layers: null,

    initComponent: function() {

        var datastore_store = Studio.datastoreStore.getStore();
        var layertemplate_store = Studio.layertemplateStore.getStore();
        layertemplate_store.load();

        // Custom rendering Template for layertemplate combobox entries
        var ltTpl = new Ext.XTemplate(
            '<tpl for="."><div class="x-combo-list-item x-combo-list-lt-item">',
                '<h3>{name}</h3>',
                '{comment}',
            '</div></tpl>');


        var form = new Ext.form.FormPanel({
            bodyStyle: 'padding:5px',
            border: false,
            items: [{
                xtype: 'fieldset',
                id: this.getId() + "_fieldsetDS",
                checkboxToggle:true,
                collapsed: false,
                title: OpenLayers.i18n('From a datasource'),
                autoHeight: true,
                labelWidth: 150,
                defaults: {
                    width: 400                    
                },
                listeners: {
                	expand: function(fieldset) {
                	    Ext.getCmp(this.getId() + "_fieldsettpl").collapse();
                    },
                    scope: this
                },
                items: [{
                    xtype: 'studio.datastorecombo',
                    id: this.id + '_datastore_combo',
                    name: 'datastore',
                    fieldLabel: OpenLayers.i18n('Data store'),
                    emptyText: OpenLayers.i18n('Choose one store'),
                    store: datastore_store,
                    displayField: 'text',
                    valueField: 'id',
                    typeAhead: true,
                    editable: false,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: true,
                    iconClsField: 'icon',
                    listeners: {
                        select: function(combo, record, index) {
                            // FIXME: http://extjs.com/learn/Ext_FAQ_ComboBox#linked_comboBoxes
                            var datasource_combo = Ext.getCmp(this.id + '_datasource_combo');
                            datasource_combo.store = Studio.getDatasourceStore(combo.getValue()).getStore();
                            datasource_combo.setDisabled(false);
                            datasource_combo.reset();
                            var layertemplate_combo = Ext.getCmp(this.id + '_layertemplate_combo');
                            layertemplate_combo.reset();
                            var ok_button = Ext.getCmp(this.id + '_ok_button');
                            ok_button.setDisabled(true);
                        },
                        scope: this
                    }
                },{
                    xtype: 'combo',
                    id: this.id + '_datasource_combo',
                    name: 'datasource',
                    fieldLabel: OpenLayers.i18n('Data source'),
                    emptyText: OpenLayers.i18n('Choose one source'),
                    disabled: true,
                    store: null,
                    displayField: 'text',
                    valueField: 'id',
                    typeAhead: true,
                    editable: false,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: true,
                    listeners: {
                        select: function(combo, record, index) {
                            var ok_button = Ext.getCmp(this.id + '_ok_button');
                            ok_button.setDisabled(false);
                        },
                        scope: this
                    }
                }]
            },{
                xtype: 'fieldset',
                id: this.getId() + "_fieldsettpl",
                checkboxToggle:true,
                collapsed:true,
                title: OpenLayers.i18n('Using an existing template'),
                autoHeight: true,
                labelWidth: 150,
                defaults: {
                    width: 400
                },
                listeners: {
                	expand: function(fieldset) {
                	    Ext.getCmp(this.getId() + "_fieldsetDS").collapse();
                    },
                    scope: this
                },
                items: [{
                    xtype: 'combo',
                    id: this.id + '_layertemplate_combo',
                    name: 'layertemplate',
                    tpl: ltTpl,
                    fieldLabel: OpenLayers.i18n('Layer template'),
                    emptyText: OpenLayers.i18n('Choose one template'),
                    disabled: false,
                    store: layertemplate_store,
                    displayField: 'name',
                    valueField: 'id',
                    typeAhead: true,
                    editable: false,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: true,
                    listeners: {
                        select: function(combo, record, index) {
                            var datastore_combo = Ext.getCmp(this.id + '_datastore_combo');
                            datastore_combo.reset();
                            var datasource_combo = Ext.getCmp(this.id + '_datasource_combo');
                            if (datasource_combo.store != null) {
                                datasource_combo.reset();
                                datasource_combo.setDisabled(true);
                            }
                            var ok_button = Ext.getCmp(this.id + '_ok_button');
                            ok_button.setDisabled(false);
                        },
                        scope: this
                    }
                }]
            }],
            buttons: [{
                id: this.id + '_ok_button',
                text: 'OK',
                disabled: true,
                handler: function() {
                    var values = getFormValues(form);
                    var record;
                    if ((values.datastore != null) && (values.datasource != null)) {
                        var datasource_store = Ext.getCmp(this.id + '_datasource_combo').store;
                        record = datasource_store.getAt(datasource_store.find('id', values.datasource));
                        var ds_interface = record.getInterface();
                        ds_interface.get_mapfile({
                            success: function(obj) {
                                obj.name = getUniqueLayerName(this.layers,obj.name);
                                this.layers.push(obj);
                                this.fireEvent('layercreated', obj);
                                this.close();
                            },
                            failure: function() {
                                Ext.MessageBox.alert("Error",
                                    "An error occured while creating the layer. " +
                                    "Please report the problem.");
                            },
                            scope: this
                        });
                    }
                    else if (values.layertemplate != null) {
                        record = layertemplate_store.getAt(layertemplate_store.find('id', values.layertemplate));
                        var lt_interface = record.getInterface();
                        lt_interface.read({
                            success: function(obj) {
                                //obj.json.name = randomString() + ' [From: ' + obj.name + ']';
                                this.fireEvent('layercreated', obj.json);
                                this.close();
                            },
                            failure: function() {
                                Ext.MessageBox.alert("Error",
                                    "An error occured while creating the layer from layer template. " +
                                    "Please report the problem.");
                            },
                            scope: this
                        });
                    }
                },
                scope: this
            }, {
                text: OpenLayers.i18n('Cancel'),
                handler: function() {
                    this.close();
                },
                scope: this
            }]
        });

        this.items = [form];

        /*
         Create a unique layer name with a random string
         */
        var getUniqueLayerName = function(layers, currentLayername) {
            for (var i = 0; i<layers.length; i++) {
                if (layers[i].name == currentLayername) {
                    currentLayername = currentLayername + randomString();
                }
            }
            return currentLayername;
        };

        Studio.MapfileMgr.AddLayerWindow.superclass.initComponent.apply(this, arguments);
    }
});
