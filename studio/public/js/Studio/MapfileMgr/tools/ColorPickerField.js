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
