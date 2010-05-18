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

Studio.MapfileMgr.NumberSpinner = Ext.extend(Ext.form.NumberField,  {
    defaultValue: null,

    initComponent: function() {
        this.addSpinner();
        Studio.MapfileMgr.NumberSpinner.superclass.initComponent.apply(this, arguments);
    },

    addSpinner: function() {
        var spinner=new Ext.ux.form.Spinner({
            strategy: new Ext.ux.form.Spinner.NumberStrategy({
                minValue: this.minValue,
                maxValue: this.maxValue,
                allowDecimals: this.allowDecimals,
                decimalPrecision: this.decimalPrecision,
                defaultValue: this.defaultValue||0,
                incrementValue: this.incrementValue||1
            })
        });
        this.on('render', function() {
            spinner.applyToMarkup(this.getEl());
            spinner.splitter.hide(); //not well placed and not very useful => I get rid of it
        }, this);
        spinner.on('spin', function() {
            this.fireEvent('change', this, null, null);
        }, this);
        this.on('enable', spinner.enable,  spinner);
        this.on('disable', spinner.disable,  spinner);
    }
});
Ext.reg('studio.mm.numberspinner', Studio.MapfileMgr.NumberSpinner);
