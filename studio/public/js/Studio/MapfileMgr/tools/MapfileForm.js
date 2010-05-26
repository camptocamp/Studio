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

Studio.MapfileMgr.MapfileForm = Ext.extend(Ext.FormPanel, {

    /**
     * Property: properties
     * The mapfile properties being edited
     * {Object}
     */
    properties: null,

    /**
     * APIProperty: mapfileInterface
     * The currently selected MapFileInterface
     * {Studio.interface.MapfileInterface}
     */
    mapfileInterface: null,

    initComponent:function() {
        Studio.MapfileMgr.MapfileForm.superclass.initComponent.apply(this, arguments);

        this.addEvents(
            /**
             * @event change
             * Fires just before any change event is fired on any form field of this panel children.
             */
                'change',

            /**
             * @event namechange
             * Fires when the name property is changed.
             */
                'namechange'
                );
    },

    /**
     * APIMethod: visitStyler
     *
     * Visit the widget structure for filling the mapfile (for example).
     *
     * Parameters:
     * visitor - {Object} the visitor to call
     */
    visitStyler: function(visitor) {
        var subVisitor = visitor.beginPanel(this);
        if (subVisitor) {
            Studio.MapfileMgr.MapfilePanel.visitItems(this, subVisitor);
            if (subVisitor.destroy) subVisitor.destroy();
        }
        visitor.endPanel(this);
    },

    /**
     * APIMethod: loadData
     *
     * Fills the form with the data coming from the properties
     */
    loadData: function() {
        this.visitStyler(new Studio.MapfileMgr.MapfileToFormVisitor(this.properties, this.mapfileInterface));
        this.doLayout();
        this.doLayout(); //have to do it twice for fieldsets
    },

    /**
     * APIMethod: getData
     *
     * Return the properties comming from the form
     */
    getData: function() {
        this.visitStyler(new Studio.MapfileMgr.FormToMapfileVisitor(this.properties));
        return this.properties;
    }
});

Ext.reg('studio.mm.mapfileform', Studio.MapfileMgr.MapfileForm);

/**
 * Overrides Ext.form.Field class so that the container FormPanel is aware that something changed
 * Taken from https://extjs.com/forum/showthread.php?p=208833
 */
Ext.override(Ext.form.Field, {

    // private
    afterRender : function() {
        Ext.form.Field.superclass.afterRender.call(this);
        this.initEvents();
        this.initValue();

        var event = 'change';
        if (this.isXType('radio')) {
            // the "change" event is not working for radio buttons
            event = 'check';
        }

        // TODO maybe we should use relayEvents here
        this.on(event, function(field, v, startValue) {
            var f = getFormPanel(field);
            if (f) {
                f.fireEvent('change', field, v, startValue);
            }
        }, this);
    }
});

/**
 * Fix checkboxgroups.
 */
var origCheckboxGroupOnRender = Ext.form.CheckboxGroup.prototype.onRender;
Ext.override(Ext.form.CheckboxGroup, {
    onRender: function(ct, position) {
        origCheckboxGroupOnRender.apply(this, arguments);

        //fix the ownerCt link
        if (this.items.each) {
            this.items.each(function(item) {
                item.ownerCt = this.ownerCt;
            }, this);
        } else {
            for (var i = 0; i < this.items.length; ++i) {
                this.items[i].ownerCt = this.ownerCt;
            }
        }
    }
});
