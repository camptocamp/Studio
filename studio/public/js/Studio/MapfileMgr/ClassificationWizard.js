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

Studio.MapfileMgr.ClassificationWizard = Ext.extend(Ext.Window, {

    /**
     * Property: layer
     * The currently selected Layer
     * {Object}
     */
    layer: null,

    /**
     * Property: classification
     * The classification as returned by the server and to be applied
     * {Object}
     */
    classification: null,

    /**
     * Property: methodsStore
     */
    methodsStore: new Ext.data.SimpleStore({
        fields: ['text', 'value'],
        data : [[
            OpenLayers.i18n('Unique values'), 'unique'
        ],[
            OpenLayers.i18n('Quantiles'), 'quantile'
        ]],
        autoLoad: true
    }),

    /**
     * Property: themesStore
     */
    themesStore: new Ext.data.SimpleStore({
        fields: ['value', 'colors']
    }),

    /**
     * Property: interpolationsStore
     */
    interpolationsStore: new Ext.data.SimpleStore({
        fields: ['value'],
        data : [['RGB'],['HSV']],
        autoLoad: true
    }),

    /**
     * Property: classTemplate
     */
    classTemplate: new Ext.XTemplate(
        '<div>',
            '<div style="float:left;margin-right:3px;width:20px;height:15px;',
                'background-color:rgb(',
                '<tpl for="styles">',
                    '{color}',
                '</tpl>',
                ');"',
            '</div>',
            '<div class="x-form-item">',
                '{name}',
            '</div>',
        '</div>'
    ),

    /**
     * Property: loadingMask
     * A load mask
     * {Ext.LoadMask}
     */
    loadingMask: null,

    title: OpenLayers.i18n('Classification Wizard'),
    layout: 'fit',
    modal: true,
    border: false,
    width: 600,
    height: 400,

    initComponent: function() {
        this.addEvents({
            /**
             * Event fired when the classification is ready
             */
            classificationready: true
        });

        this.bbar = ['->', {
            id: this.getId() + '_apply_button',
            text: OpenLayers.i18n('Apply'),
            disabled: true,
            handler: function() {
                this.fireEvent('classificationready', this, this.layer, this.classification.classes);
            },
            scope: this
        },{
            text: OpenLayers.i18n('Cancel'),
            handler: function() {
                this.close();
            },
            scope: this
        }];

        var palettesRaw = [
            [[141,211,199],[255,255,179],[190,186,218],[251,128,114],[128,177,211],[253,180,98],
                [179,222,105],[252,205,229],[217,217,217],[188,128,189],[204,235,197],[255,237,111]],

            [[166,206,227],[31,120,180],[178,223,138],[51,160,44],[251,154,153],[227,26,28],
                [253,191,111],[255,127,0],[202,178,214],[106,61,154],[255,255,153]],

            [[251,180,174],[179,205,227],[204,235,197],[222,203,228],[254,217,166],[255,255,204],
                [229,216,189],[253,218,236],[242,242,242]],

            [[228,26,28],[55,126,184],[77,175,74],[152,78,163],[255,127,0],[255,255,51],[166,86,40],
                [247,129,191],[153,153,153]],

            [[179,226,205],[253,205,172],[203,213,232],[244,202,228],[230,245,201],[255,242,174],
                [241,226,204],[204,204,204]],

            [[102,194,165],[252,194,165],[141,160,203],[231,138,195],[166,216,84],[255,217,47],
                [229,196,148],[179,179,179]],

            [[27,158,119],[217,95,2],[117,112,179],[231,41,138],[102,166,30],[230,171,2],
                [166,118,29],[102,102,102]],

            [[127,201,127],[190,174,212],[253,192,134],[255,255,153],[56,108,176],[240,2,127],
                [191,91,23],[102,102,102]]];

        var palettes = [];
        Ext.each(palettesRaw, function(palette, index) {
            palettes[index] = [];
            palettes[index].push(index);
            var colors = [];
            Ext.each(palette, function(color) {
                colors.push('rgb(' + color.join(',') + ')');
            });
            palettes[index].push(colors);

        });
        this.themesStore.loadData(palettes);

        this.items = new Ext.form.FormPanel({
            id: this.getId() + '_formpanel',
            border: false,
            labelAlign: 'top',
            layout: 'border',
            defaults: {
                bodyStyle: "padding:5px;",
                border: false
            },
            items: [{
                region: 'north',
                height: 50,
                layout: 'column',
                defaults: {
                    layout: 'form',
                    columnWidth: 0.5,
                    border: false
                },
                items: [{
                    items : [{
                        xtype: 'studio.mm.columncombo',
                        id: this.getId() + '_column',
                        fieldLabel: OpenLayers.i18n('Choose attribute'),
                        layer: this.layer.attributes.properties,
                        name: 'attribute',
                        listeners: {
                            selectpvi: this.attributeChosen,
                            scope: this
                        }
                    }]
                },{
                    items : [{
                        xtype: 'combo',
                        id: this.getId() + '_method',
                        fieldLabel: OpenLayers.i18n('Choose method'),
                        store: this.methodsStore,
                        displayField: 'text',
                        valueField: 'value',
                        hidden: true,
                        hiddenName: 'classification',
                        typeAhead: true,
                        editable: false,
                        mode: 'local',
                        forceSelection: true,
                        triggerAction: 'all',
                        emptyText: OpenLayers.i18n('Select a method...'),
                        selectOnFocus:true,
                        listeners: {
                            selectpvi: this.methodChosen,
                            scope: this
                        }
                    }]
                }]
            },{
                region: 'west',
                width: 250,
                layout: 'form',
                items: [{
                    xtype: 'hidden',
                    id: this.getId() + '_colortype',
                    name: 'colortype'
                },{
                    xtype: 'studio.mm.numberspinner',
                    id: this.getId() + '_numclasses',
                    fieldLabel: OpenLayers.i18n('Number of classes'),
                    hidden: true,
                    name: 'intervals',
                    hideMode: "display",
                    allowNegative: false,
                    allowDecimals: false,
                    width: 40,
                    value: 5,
                    minValue: 2,
                    maxValue: 20
                },{
                    xtype: 'studio.mm.colorpickerfield',
                    id: this.getId() + '_startcolor',
                    fieldLabel: OpenLayers.i18n('First color'),
                    hidden: true,
                    name: 'startcolor',
                    value: '#FFFFFF'
                },{
                    xtype: 'studio.mm.colorpickerfield',
                    id: this.getId() + '_endcolor',
                    fieldLabel: OpenLayers.i18n('Last color'),
                    hidden: true,
                    name: 'endcolor',
                    value: '#497BD1'
                },{
                    xtype: 'combo',
                    id: this.getId() + '_interpolation',
                    fieldLabel: OpenLayers.i18n('Choose interpolation'),
                    store: this.interpolationsStore,
                    displayField: 'value',
                    valueField: 'value',
                    hidden: true,
                    name: 'interpolation',
                    typeAhead: true,
                    editable: false,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus:true,
                    width: 100,
                    value: 'RGB'
                },{
                    xtype: 'palettecombo',
                    id: this.getId() + '_theme',
                    fieldLabel: OpenLayers.i18n('Choose a predefined palette'),
                    store: this.themesStore,
                    valueField: 'value',
                    hidden: true,
                    hiddenName: 'theme',
                    typeAhead: true,
                    editable: false,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    value: 0,
                    selectOnFocus:true,
                    listeners: {
                        selectpvi: this.themeChosen,
                        scope: this
                    }
                }],
                buttons: [{
                    id: this.getId() + '_classify_button',
                    text: OpenLayers.i18n('Classify'),
                    disabled: true,
                    handler: this.classify,
                    scope: this
                }]
            },{
                id: this.getId() + '_classes',
                region: 'center',
                autoScroll: true
            }]
        });

        Studio.MapfileMgr.ClassificationWizard.superclass.initComponent.apply(this, arguments);
    },

    /**
     * Method: attributeChosen
     * The user as selected a value in the attribute combo
     *
     * Parameters:
     * combo {Ext.form.Combobox}
     * record
     * index {integer}
     */
    attributeChosen: function(combo, v) {
        this.methodsStore.clearFilter();
        var value = combo.getValue();
        var type = Studio.getColumnType(this.layer.attributes.properties, value);
        
        Ext.getCmp(this.getId() + '_method').show();
        Ext.getCmp(this.getId() + '_method').doQuery(null); //  required so that filter can work 

        switch (type) {
            case 'numeric':
                break;
            case 'string':
                    
                // only unique values is supported for this type of column
                this.methodsStore.filter('value', 'unique');
                Ext.getCmp(this.getId() + '_method').setValue('unique');
                break;
            default:
                break;
        }
    },

    /**
     * Method: methodChosen
     * The user as selected a value in the method combo
     *
     * Parameters:
     * combo {Ext.form.Combobox}
     * record
     * index {integer}
     */
    methodChosen: function(combo, v) {
        var value = combo.getValue();

        Ext.getCmp(this.getId() + '_colortype').show();

        switch (value) {
            case 'quantile':
                Ext.getCmp(this.getId() + '_theme').hide();
                Ext.getCmp(this.getId() + '_theme').disable();
                Ext.getCmp(this.getId() + '_numclasses').show();
                Ext.getCmp(this.getId() + '_numclasses').enable();
                Ext.getCmp(this.getId() + '_interpolation').show();
                Ext.getCmp(this.getId() + '_interpolation').enable();
                Ext.getCmp(this.getId() + '_startcolor').show();
                Ext.getCmp(this.getId() + '_startcolor').enable();
                Ext.getCmp(this.getId() + '_endcolor').show();
                Ext.getCmp(this.getId() + '_endcolor').enable();
                Ext.getCmp(this.getId() + '_colortype').setValue('ramp');
                break;
            case 'unique':
                Ext.getCmp(this.getId() + '_numclasses').hide();
                Ext.getCmp(this.getId() + '_numclasses').disable();
                Ext.getCmp(this.getId() + '_startcolor').hide();
                Ext.getCmp(this.getId() + '_startcolor').disable();
                Ext.getCmp(this.getId() + '_endcolor').hide();
                Ext.getCmp(this.getId() + '_endcolor').disable();
                Ext.getCmp(this.getId() + '_interpolation').hide();
                Ext.getCmp(this.getId() + '_interpolation').disable();
                Ext.getCmp(this.getId() + '_theme').show();
                Ext.getCmp(this.getId() + '_theme').enable();
                Ext.getCmp(this.getId() + '_colortype').setValue('qualitative');
                break;
        }
        Ext.getCmp(this.getId() + '_classify_button').enable();
    },

    /**
     * Method: themeChosen
     * The user as selected a value in the theme combo
     *
     * Parameters:
     * combo {Ext.form.Combobox}
     * record
     * index {integer}
     */
    themeChosen: function(combo, v) {
        //Ext.getCmp(this.getId() + '_classify_button').enable();
    },

    /**
     * Method: classify
     * Call the server to retrieve the computed classes
     */
    classify: function() {

        if (!this.loadingMask) {
            this.loadingMask = new Ext.LoadMask(Ext.getCmp(this.getId() + '_classes').body, {
                msg: 'Loading'
            });
        }
        this.loadingMask.show();

        var form = Ext.getCmp(this.getId() + '_formpanel').getForm();

        var url = subString(
                Studio.datastoreStore.datasourceMapfileUrlScheme,
                {"DATASTORE_ID": this.layer.attributes.properties.metadata.datastoreid,
                 "DATASOURCE_ID": this.layer.attributes.properties.metadata.datasourceid});

        Ext.Ajax.request({
            url: url,
            method: "GET",
            timeout: 300000,      // 5 minutes maximum
            params: form.getValues(),
            success: function(response) {
                var el = Ext.getCmp(this.getId() + '_classes').body;
                Ext.getDom(el).innerHTML = '';
                this.classification = Ext.util.JSON.decode(response.responseText);
                Ext.each(this.classification.classes, function(clazz) {
                    this.classTemplate.append(
                        el,
                        clazz
                    );
                }, this);
                this.loadingMask.hide();
                Ext.getCmp(this.getId() + '_apply_button').enable();
            },
            failure: function(response) {
            		this.loadingMask.hide();
                    Ext.MessageBox.alert(OpenLayers.i18n('Error'),
                    		OpenLayers.i18n("Classification didn't succed, probably due to a timeout. Status text: ") + response.statusText + ". "+OpenLayers.i18n('Status code')+": " + response.status);
                     
            },
            scope: this
        });

    }

});

/**
 * Taken from http://extjs.com/forum/showthread.php?t=25479
 * Modified a little to support display/hideMode
 */
Ext.override(Ext.layout.FormLayout, {
    renderItem : function(c, position, target){
        if(c && !c.rendered && c.isFormField && c.inputType != 'hidden'){
            var args = [
                   c.id, c.fieldLabel,
                   c.labelStyle||this.labelStyle||'',
                   this.elementStyle||'',
                   typeof c.labelSeparator == 'undefined' ? this.labelSeparator : c.labelSeparator,
                   (c.itemCls||this.container.itemCls||'') + (c.hideLabel ? ' x-hide-label' : ''),
                   c.clearCls || 'x-form-clear-left'
            ];
            if(typeof position == 'number'){
                position = target.dom.childNodes[position] || null;
            }
            if(position){
                c.formItem = this.fieldTpl.insertBefore(position, args, true);
            }else{
                c.formItem = this.fieldTpl.append(target, args, true);
            }

            if (c.hideMode == 'display') {
                c.formItem.setVisibilityMode(Ext.Element.DISPLAY);
            }

//          Remove the form layout wrapper on Field destroy.
            c.on('destroy', c.formItem.remove, c.formItem, {single: true});
            c.on('hide', c.formItem.hide, c.formItem, {single: false});
            c.on('show', c.formItem.show, c.formItem, {single: false});
            c.render('x-form-el-'+c.id);
        }else {
            Ext.layout.FormLayout.superclass.renderItem.apply(this, arguments);
        }
    }
});
