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

Studio.MapfileMgr.LimitByScalePanel = Ext.extend(Studio.MapfileMgr.MapfilePanel, {
    minScale: 0,		  //TODO: what value, here? Depend of map.
    maxScale: 500*1000*1000,  //TODO: what value, here? Depend of map.
    increment: 1000,      //TODO: what value, here? Depend of map

    ignoreChangeEvents: false,

    /**
     * APIProperty: map
     * {OpenLayers.Map} the map
     */
    map: null,

    initComponent: function() {
        var config = {
            width: '100%',
            border: false,
            layout: 'form',
            defaults: {
                width: '100%'
            }
        };
        Ext.applyIf(this, config);

        var self = this;
        this.items = [{
            layout: 'table',
            border: false,
            layoutConfig: {
                columns: 4
            },
            defaults: {
                border: false,
                labelWidth: 60,
                width: '100%'
            },
            items:[{
            	layout: 'form',
                cellCls: 'studioRightPadding',
                items: [{
                    xtype: 'numberfield',
                    id: this.getId() + "_minScale",
                    fieldLabel: OpenLayers.i18n('Min scale'),
                    name: 'minscaledenom',
                    width: "100%",
                    minValue: this.minScale,
                    maxValue: this.maxScale,
                    validator: function(value) {
                        Ext.getCmp(self.getId() + "_maxScale").validate();
                        return true;
                    },
                    listeners: {
                        valid: this.updateSlider,
                        scope: this
                    }
                }]
            },{
            	xtype: 'button',
            	cellCls: 'studioMaxTableButton',
            	id: this.getId() + "_minScaleButton",
            	text: OpenLayers.i18n('Get from map'),
            	handler: function(){
            	    this.minScale = Math.round(this.map.getScale());
            	    Ext.getCmp(self.getId() + "_minScale").setValue(this.minScale);
            	},
                scope: this
            },{
            	layout: 'form',
                items: [{
                    xtype: 'numberfield',
                    id: this.getId() + "_maxScale",
                    fieldLabel: OpenLayers.i18n('Max scale'),
                    name: 'maxscaledenom',
                    width: "100%",
                    minValue: this.minScale,
                    maxValue: this.maxScale,
                    validator: function(value) {
                        var minScaleTxt = Ext.getCmp(self.getId() + "_minScale").getValue();
                        if (minScaleTxt === "") return true;
                        var minScale = parseInt(minScaleTxt);
                        if (parseInt(value) <= minScale) {
                            return OpenLayers.i18n("Must be bigger than Min Scale (") + minScale + ")";
                        } else {
                            return true;
                        }
                    },
                    listeners: {
                        valid: this.updateSlider,
                        scope: this
                    }
                }]
            },{
            	xtype: 'button',
            	cellCls: 'studioMaxTableButton',
            	id: this.getId() + "_maxScaleButton",
            	text: OpenLayers.i18n('Get from map'),
            	handler: function(){
            	    this.maxScale = Math.round(this.map.getScale());
            	    Ext.getCmp(self.getId() + "_maxScale").setValue(this.maxScale);
            	},
                scope: this
            },{
                colspan: 4,
                xtype: 'gx_multislider', //TODO: maybe have a logarithmic slider?
                cellCls: 'studioRightPadding',
                id: this.getId() + "_slider",
                width: '100%',
                minValue: 0,
                maxValue: 10000000,
                values: [this.minScale, this.maxScale],
                increment: this.increment,
                listeners: {
                    change: this.updateValues,
                    changecomplete: this.updateValuesComplete,
                    render: this.updateSlider,
                    scope: this
                }
            }]
        }];
        Studio.MapfileMgr.LimitByScalePanel.superclass.initComponent.apply(this, arguments);
    },

    updateValues: function(slider, values) {
        if (this.ignoreChangeEvents) return;
        this.ignoreChangeEvents = true;
        var minScale = Ext.getCmp(this.getId() + "_minScale");
        if (values[0] > this.minScale) {
            minScale.setValue(values[0]);
        } else {
            minScale.setValue("");
        }
        var maxScale = Ext.getCmp(this.getId() + "_maxScale");
        if (values[1] < this.maxScale) {
            maxScale.setValue(values[1]);
        } else {
            maxScale.setValue("");
        }
        this.ignoreChangeEvents = false;
    },

    updateValuesComplete: function(slider) {
        // force the "change" event to be fired
        // actually it would be better to know which value (min or max) changed
        var minScale = Ext.getCmp(this.getId() + "_minScale");
        minScale.fireEvent('change', minScale, null, null);
    },

    updateSlider: function() {
        if (this.ignoreChangeEvents) return;
        this.ignoreChangeEvents = true;
        var slider = Ext.getCmp(this.getId() + "_slider");
        var minScaleTxt = Ext.getCmp(this.getId() + "_minScale").getValue();
        var maxScaleTxt = Ext.getCmp(this.getId() + "_maxScale").getValue();
        var minScale = minScaleTxt === "" ? this.minScale : parseInt(minScaleTxt);
        var maxScale = maxScaleTxt === "" ? this.maxScale : parseInt(maxScaleTxt);
        slider.setValues([minScale, maxScale]);
        this.ignoreChangeEvents = false;
    }
});
Ext.reg('studio.mm.limitbyscale', Studio.MapfileMgr.LimitByScalePanel);
