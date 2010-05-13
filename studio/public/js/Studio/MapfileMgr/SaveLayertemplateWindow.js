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
