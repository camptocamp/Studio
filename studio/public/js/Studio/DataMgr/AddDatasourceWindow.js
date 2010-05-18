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

Ext.namespace('Studio', 'Studio.DataMgr');

Studio.DataMgr.AddDatasourceWindow = Ext.extend(Ext.Window, {
    title: OpenLayers.i18n('Add a datasource'),
    layout: 'form',
    modal: true,
    width: 400,
    datastoreId: null,
    
    initComponent: function() {
        var form = new Ext.form.FormPanel({
            bodyStyle: 'padding:5px',
            fileUpload: true,
            border: false,
            items: [{
                fieldLabel: OpenLayers.i18n('datasource'),
                labelWidth: 120, // FIXME: do not works ...
                xtype: 'fileuploadfield',
                name: 'datasources',
                listeners: {
                    fileselected: function(fb, v) {
                        Ext.getCmp(this.id + '_add_button').setDisabled(false);
                    },
                    scope: this
                }
            }],
            buttons: [{
                text: OpenLayers.i18n('add'),
                id: this.id + '_add_button',
                disabled: true,
                handler: function() {
                    form.getForm().submit({
                        url: subString(Studio.datastoreStore.datasourceUrlScheme, {
                            DATASTORE_ID: this.datastoreId
                        }),
                        waitMsg: OpenLayers.i18n('Uploading file...'),
                        success: function(fp, o) {
                            this.fireEvent('fileuploaded');
                            this.close();
                        },
                        scope: this
                    });
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
    
        Studio.DataMgr.AddDatasourceWindow.superclass.initComponent.apply(this, arguments);
    }
});
