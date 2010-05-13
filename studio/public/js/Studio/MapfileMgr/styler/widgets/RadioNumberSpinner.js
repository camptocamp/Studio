/**
 * Class: Studio.MapfileMgr.RadioNumberSpinner
 *
 * A mix between a radiogroup and a number spinner. You define choices for
 * hardcoded values and there is a last choice added that allows the set a user
 * defined value from a number spinner
 */
Studio.MapfileMgr.RadioNumberSpinner = function(config){
    var items = config.items = [];
    var i=0;
    for (var key in config.choices) {
        items.push({
            xtype: 'radio',
            name: config.name + '_type',
            boxLabel: config.choices[key],
            inputValue: key,
            checked: i++ == 0
        });
    }

    items.push({
        xtype: 'radio',
        name: config.name + '_type',
        boxLabel: '',
        inputValue: '__',
        listeners: {
            'check': function(radio, checked) {
                var textField = Ext.getCmp(config.id + '_value');
                textField.setDisabled(!checked);
                if(checked && textField.getValue()==='') {
                    textField.setValue("0");
                } else if(!checked) {
                    textField.setValue("");                    
                }
            }
        }
    });
    items.push({
        xtype: 'studio.mm.numberspinner',
        id: config.id + '_value',
        name: config.name + '_value',
        disabled: true,
        width: 40,
        defaultValue: 0,
        minValue: -180,
        maxValue: 360,
        incrementValue: 45,
        listeners: {
            'render': function(field) {
                //I don't know why, but Ext is lost and sets a width=0 on the parent DIV... fixing that
                var el=field.getEl().parent();
                el.setWidth(60);
            }
        }
    });
    Studio.MapfileMgr.RadioNumberSpinner.superclass.constructor.apply(this, arguments);
};


Ext.extend(Studio.MapfileMgr.RadioNumberSpinner, Ext.form.RadioGroup, {
    /**
     * APIProperty: choices
     * {Object} The dictionary of hardcoded values and their displayed labels.
     */
    choices: null,

    /**
     * APIProperty: name
     * {String} The field name
     */
    name: null,

    initComponent: function() {
        Studio.MapfileMgr.RadioNumberSpinner.superclass.initComponent.apply(this, arguments);
    },

    visitStyler: function(visitor) {
        var valueField = Ext.getCmp(this.getId() + '_value');
        var first = this.items.get(0);
        var oldValue = first.getGroupValue();
        if(oldValue == '__') {
            oldValue = valueField.getValue();
        }
        var newValue = visitor.value(this, this.name, oldValue);
        if (oldValue != newValue) {
            if(this.choices[newValue]) {
                valueField.setValue('');
                first.setValue(newValue);
            } else {
                valueField.setValue(newValue);
                first.setValue('__');
            }
        }
    }
});
Ext.reg('studio.mm.radionumberspinner', Studio.MapfileMgr.RadioNumberSpinner);
