Studio.MapfileMgr.WfsAttributesPanel = function(config) {

    var metadata = config.layer.metadata;
    if (metadata && metadata.datasourceid && metadata.datastoreid) {
        var columnsStore = Studio.getDatasourceColumnStore(metadata.datastoreid, metadata.datasourceid).getStore();
    }
    var itemsToInclude = metadata.gml_include_items || "";

    this.store = new Ext.data.SimpleStore({
        fields: ['name', 'alias', 'selected']
    });

    // custom column plugin example
    var checkColumn = new Ext.grid.CheckColumn({
        dataIndex: 'selected',
        width: 40
    });

    this.cm = new Ext.grid.ColumnModel([
        checkColumn,
        {
            id: 'name',
            width: 180,
            header: OpenLayers.i18n('Data attribute'), 
            dataIndex: 'name'
        },
        {
            header: OpenLayers.i18n('Alias (click to edit)'), 
            width: 180,
            dataIndex: 'alias',
            editor: new Ext.form.TextField({
                allowBlank: false
            })
        }
    ]);
    this.plugins = checkColumn;
    
    // call parent constructor
    Studio.MapfileMgr.WfsAttributesPanel.superclass.constructor.call(this, config);

    var attributes = [];

    var loadData = function(columns) {
        // populate the grid store with the column names and aliases
        columns.each(function(record) {
            var name = record.get('name');
            var alias = metadata['gml_' + name + '_alias'] || name;
            var selected = itemsToInclude.indexOf(record.get('name')) != -1;
            var attribute = [
                name,
                alias,
                selected
            ];
            attributes.push(attribute);
        }, this);
        this.store.loadData(attributes);
    };

    if (columnsStore.getCount() > 0) {
        loadData.call(this, columnsStore);
    } else {
        columnsStore.on('load', loadData, this);
    }

    // get the form container aware of any change
    this.store.on('update', function(){
        var  f = getFormPanel(this);
        if (f) {
            f.fireEvent('change', this, null);
        }
    }, this);
};

Ext.extend(Studio.MapfileMgr.WfsAttributesPanel, Ext.grid.EditorGridPanel, {
    autoScroll: true,
    clicksToEdit: 1,
    enableHdMenu: false,

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
            subVisitor.value(this);
            if (subVisitor.destroy) subVisitor.destroy();
        }
        visitor.endPanel(this);
    },

    /**
     * APIMethod: getSelectedValues
     * Builds an object with all the attributes to be stored in the layer metadata
     *
     * Return:
     * {Object}
     */
    getSelectedValues: function() {
        var v = {};
        var itemsToInclude = [];
        this.store.each(function(record) {
            var alias, name;

            alias = record.get('alias');
            name = record.get('name');
            
            if (record.get('selected') === true) {
                itemsToInclude.push(name);
            }

            v['gml_' + name + '_alias'] = alias;
        });
        v.gml_include_items = itemsToInclude.join(',');
        return v;
    }
});
Ext.reg('studio.mm.wfsattributes', Studio.MapfileMgr.WfsAttributesPanel);
