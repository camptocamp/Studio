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

Studio.MapfileMgr.SaveLayertemplateWindow = Ext.extend(Ext.Window, {

    layer: null,

    title: OpenLayers.i18n('Save as layertemplate'),
    layout: 'form',
    modal: true,
    width: 340,

    initComponent: function() {

        var form = new Ext.form.FormPanel({
            monitorValid: true,
            bodyStyle: 'padding:5px',
            border: false,
            items: [{
                xtype: 'textfield',
                id: this.getId() + '_name_field',
                width: 200,
                fieldLabel: OpenLayers.i18n('Name'),
                name: 'name',
                allowBlank:false
            },{
                xtype: 'textarea',
                id: this.getId() + '_comment_field',
                width: 200,
                fieldLabel: OpenLayers.i18n('Comment'),
                name: 'comment',
                allowBlank:false
            }],
            buttons: [{
                id: this.getId() + '_ok_button',
                text: 'OK',
                formBind: true,
                handler: function() {
                    var values = getFormValues(form);
                    var lt_store = Studio.layertemplateStore.getStore();
                    var lt = new lt_store.recordType({
                                            name: values.name,
                                            comment: values.comment,
                                            id: null,
                                            url: null
                                        });
                    lt_store.add(lt); // needed for lt to be aware of layertemplate webservice (create url)

                    var ltInterface = lt.getInterface();
                    var obj = {name: values.name, comment: values.comment, json: this.layer};
                    ltInterface.create({
                        success: function() {
                            this.close();
                        },
                        failure: function() {
                            Ext.MessageBox.alert("Error",
                                "An error occured while saving this layer as a template. " +
                                "Please report the problem.");
                        },
                        scope: this
                    }, obj);
                },
                scope: this
            }, {
                id: this.getId() + '_cancel_button',
                text: OpenLayers.i18n('Cancel'),
                handler: function() {
                    this.close();
                },
                scope: this
            }]
        });

        this.items = [form];

        Studio.MapfileMgr.SaveLayertemplateWindow.superclass.initComponent.apply(this, arguments);
    }
});
