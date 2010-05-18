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

/**
 * Class: Studio.MapfileMgr.ColorPickerField
 *
 * A text field with a background colored according to the value, with a color
 * picker.
 */
Studio.MapfileMgr.ColorPickerField = Ext.extend(Ext.ux.ColorPickerField, {

    initComponent: function() {
        Studio.MapfileMgr.ColorPickerField.superclass.initComponent.call(this);
    },

    // private
    afterRender : function() {
        Studio.MapfileMgr.ColorPickerField.superclass.afterRender.call(this);

        this.on('valid', function(field) {
            var f = getFormPanel(this);
            if (f) {
                f.fireEvent('change', field, field.getValue(), null);
            }
        }, this);
    }
});
Ext.reg('studio.mm.colorpickerfield', Studio.MapfileMgr.ColorPickerField);
