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

// Create user extensions namespace (Ext.ux)
Ext.namespace('Ext.ux');

/**
  * Ext.ux.IconCombo Extension Class
  *
  * @author  Jozef Sakalos
  * @version 1.0
  *
  * @class Ext.ux.IconCombo
  * @extends Ext.form.ComboBox
  * @constructor
  * @param {Object} config Configuration options
  */
Ext.ux.IconCombo = function(config) {

    // call parent constructor
    Ext.ux.IconCombo.superclass.constructor.call(this, config);

    this.tpl = config.tpl ||
          '<tpl for="."><div class="x-combo-list-item x-icon-combo-item {'
        + this.iconClsField
        + '}">{'
        + this.displayField
        + '}</div></tpl>'
    ;

    this.on({
        render:{scope:this, fn:function() {
            var wrap = this.el.up('div.x-form-field-wrap');
            this.wrap.applyStyles({position:'relative'});
            this.el.addClass('x-icon-combo-input');
            this.flag = Ext.DomHelper.append(wrap, {
                tag: 'div', style:'position:absolute'
            });
        }}
    });
}; // end of Ext.ux.IconCombo constructor

// extend
Ext.extend(Ext.ux.IconCombo, Ext.form.ComboBox, {

    setIconCls: function() {
        var rec = this.store.query(this.valueField, this.getValue()).itemAt(0);
        if(rec) {
            this.flag.className = 'x-icon-combo-icon ' + rec.get(this.iconClsField);
        }
    },

    setValue: function(value) {
        Ext.ux.IconCombo.superclass.setValue.call(this, value);
        this.setIconCls();
    }

}); // end of extend

Ext.reg('iconcombo', Ext.ux.IconCombo);

