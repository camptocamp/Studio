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

/**
 * This class provides a custom UI implementation for Ext TreeNodes.
 * Its aim is to add clickable images in tree nodes.
 *
 * It should be extended by subclasses.
 *
 * Example usage :
 *
 * <br>
 * <pre><code>
var LayerNodeUI = Ext.extend(Ext.tree.ActionsNodeUI, {
    actions: [{
        action: 'classify',
        qtip: 'classify using wizard',
        hide: function() {
            return this.attributes.properties.type == 'raster'
        }
    },{
        action: 'delete',
        qtip: 'delete this layer'
    }]
});

var tree = new Ext.tree.TreePanel({
    id: 'mapfiles-tree',
    rootVisible: false,
    root: {
        text: 'invisible root node',
        children: [{
            text: 'layer a',
            leaf: true,
            uiProvider: 'layer'
        }]
    },
    loader: new Ext.tree.TreeLoader({
        uiProviders: {
            'layer': LayerNodeUI
        }
    })
});

this.tree.on('action', treeOnAction, this);

function treeOnAction(node, action, e) {
    if (action == 'delete') {
        Ext.MessageBox.alert(null,  'deleting layer : ' + node.text);
    } else if (action == 'classify') {
        Ext.MessageBox.alert(null,  'classifying layer : ' + node.text);
    }
}

</code></pre>
<pre><code>
 Don't miss to add something like following in your css

.x-tree-node-actions{
    float: right;
    display: none;
}
.x-tree-node-action {
    background-position:center center;
    background-repeat:no-repeat;
    border:0 none;
    height:16px;
    margin:0;
    padding:0;
    vertical-align:top;
    width:16px;
}
.x-tree-node-actions .delete {
    background:transparent url(../images/delete.gif);
}
.x-tree-node-actions .classify {
    background:transparent url(../images/wand.gif);
}
.x-tree-node-over .x-tree-node-actions  {
    display: inline !important;
}
</pre>
 */

Ext.tree.ActionsNodeUI = Ext.extend(Ext.tree.TreeNodeUI, {
    actionsCls: 'x-tree-node-actions',
    actionCls: 'x-tree-node-action',

// private
    renderElements : function(n, a, targetNode, bulkRender){
        // add some indent caching, this helps performance when rendering a large tree
        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

        var cb = typeof a.checked == 'boolean';

        var href = a.href ? a.href : Ext.isGecko ? "" : "#";
        var bufArray = ['<li class="x-tree-node"><div ext:tree-node-id="',n.id,'" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,'" unselectable="on">'];

/** start specific code */
        bufArray = bufArray.concat(['<div class="', this.actionsCls,'">']);
        Ext.each(this.actions, function(item, index) {
            bufArray = bufArray.concat([
                '<img id="'+n.id+'_'+item.action+'" ext:qtip="', item.qtip, '" src="',this.emptyIcon,'" class="',this.actionCls,' ',item.action, '" />']);
        }, this /* scope */);
        bufArray = bufArray.concat(['</div>']);
/** end specific code */
        
        bufArray = bufArray.concat([
            '<span class="x-tree-node-indent">',this.indentMarkup,"</span>",

            '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />',
            '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon',(a.icon ? " x-tree-node-inline-icon" : ""),(a.iconCls ? " "+a.iconCls : ""),'" unselectable="on" />',
            cb ? ('<input class="x-tree-node-cb" type="checkbox" ' + (a.checked ? 'checked="checked" />' : '/>')) : '',
            '<a hidefocus="on" class="x-tree-node-anchor" href="',href,'" tabIndex="1" ',
             a.hrefTarget ? ' target="'+a.hrefTarget+'"' : "", '><span unselectable="on">',n.text,"</span></a>",
            "</div>",
            '<ul class="x-tree-node-ct" style="display:none;"></ul>',
            "</li>"]);
        var buf = bufArray.join('');

        var nel;
        if(bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl())){
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
        }else{
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
        }
        
        this.updateActions(n);
        
        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1];
        var cs = this.elNode.childNodes;

/** start specific code */
        // index is changed here because we added a div element in elNode
/** end specific code */
        this.indentNode = cs[1];
        this.ecNode = cs[2];
        this.iconNode = cs[3];
        var index = 4;     
        if(cb){
            this.checkbox = cs[4];
			// fix for IE6
			this.checkbox.defaultChecked = this.checkbox.checked;			
            index++;
        }
        this.anchor = cs[index];
        this.textNode = cs[index].firstChild;
    },

    // private
    onClick : function(e){
        // here we fire the 'action' event
        var t = e.getTarget('.' + this.actionCls);
        if(t) {
            var action = t.className.replace(this.actionCls + ' ', '');
            // second argument received by the listener is the action name (delete, etc ...)
            if (this.fireEvent("action", this.node, action, e) === false) {
                return;
            }
        }
        Ext.tree.ActionsNodeUI.superclass.onClick.apply(this, arguments);
    },

    updateActions : function(n) {
        Ext.each(this.actions, function(item, index) {
            var el = Ext.get(n.id+'_'+item.action);
            if (!el) return;
            if (typeof item.hide == 'function' && item.hide.call(n)) {
                el.setVisibilityMode(Ext.Element.DISPLAY);
                el.hide();
            } else {
                el.show();
            }
        }, this /* scope */);
    }
});
