// reference local blank image
Ext.BLANK_IMAGE_URL = 'js/Ext/resources/images/default/s.gif';

Ext.onReady(function() {

    // define urls (server side generated)
    Studio.mapfileStore.url = '${h.url_for(controller="mapfiles", action="index")}';

    Studio.datastoreStore.url = '${h.url_for(controller="datastores", action="index")}';
    Studio.datastoreStore.datasourceUrlScheme = '${h.url_for(controller="datasources", action="index", datastore_id="DATASTORE_ID")}';
    Studio.datastoreStore.datasourceColumnsUrlScheme = '${h.url_for(controller="datasources", action="showcolumns", datastore_id="DATASTORE_ID", datasource_id="DATASOURCE_ID")}';
    Studio.datastoreStore.datasourceMapfileUrlScheme = '${h.url_for(controller="datasources", action="showmapfile", datastore_id="DATASTORE_ID", datasource_id="DATASOURCE_ID")}';

    Studio.layertemplateStore.url = '${h.url_for(controller="layertemplates", action="index")}';

    // load datastores store only once (this store should never be loaded again)
    Studio.datastoreStore.getStore().load();

    Ext.QuickTips.init();

    var header = {
        id: 'header',
        region: 'north',
        contentEl: 'banner',
        height: 80
    };

    var main = {
        id: 'main',
        plain: true,
        region: 'center',
        xtype: 'tabpanel',
        margins: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        },
        % if c.show_datastores_tab:
        activeTab: 1,
        % else:
        activeTab: 0,
        % endif
        items: [
        % if c.show_datastores_tab:
        {
            xtype: "studio.dm.chooser",
            id: "studio.dm.chooser",
            title: OpenLayers.i18n('Manage datastore'),
            defaults: {
                border: false
            }
        },
        % endif
        {
            xtype: "studio.mm.chooser",
            id: "studio.mm.chooser",
            title: OpenLayers.i18n('Manage mapfiles'),
            defaults: {
                border: false
            }
        }
        ]
    };

    new Ext.Viewport({
        layout: 'border',
        defaults: {
            border: false,
            frame: false
        },
        items: [
            header,
            main
        ]
    });
});
