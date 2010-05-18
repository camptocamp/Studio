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

Ext.tree.RestTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    baseUrl: null,
    urlPostfix: null,
    preProcessNode: null,
    root: null,

    requestMethod: 'GET',

    constructor: function(config) {
        Ext.tree.RestTreeLoader.superclass.constructor.call(this, config);
        this.baseUrl = this.dataUrl || this.url;
    },

    requestData: function(node, callback) {
        if (node.isRoot) {
            this.url = this.baseUrl;
        } else {
            this.url = this.baseUrl + '/' + node.id;
        }
        if (this.urlPostfix) {
            this.url += this.urlPostfix;
        }

        Ext.tree.RestTreeLoader.superclass.requestData.apply(this, arguments);
    },

    processResponse: function(response, node, callback) {
        if (this.root) {
            var json = Ext.util.JSON.decode(response.responseText);
            response.responseText = Ext.util.JSON.encode(json[this.root]);
        }
        return Ext.tree.RestTreeLoader.superclass.processResponse.apply(this, arguments);
    },

    createNode: function(attr) {
        if (this.preProcessNode) {
            if (!this.preProcessNode(attr)) {
                return null;
            }
        }
        return Ext.tree.RestTreeLoader.superclass.createNode.apply(this, arguments);
    }
});

Ext.tree.MapfileTreeLoader = Ext.extend(Ext.tree.RestTreeLoader, {

    createNode: function(attr) {
        if (attr.name !== undefined) {
            attr.text = attr.name;
        }
        if (attr.layers !== undefined) {
            attr.children = attr.layers;
            attr.role = 'record';
            for (var i = 0, len = attr.children.length; i < len; i++) {
                attr.children[i].leaf = true;
                attr.children[i].role = 'layer';
            }
        }
        return Ext.tree.RestTreeLoader.superclass.createNode.apply(this, [attr]);
    }
});

var getFormValues = function(form) {
    var result = {};
    form.cascade(function(cur) {
        if (cur.disabled != true) {
            if (cur.isXType('boxselect')) {
                if (cur.getValue && cur.getValue()) {
                    result[cur.getName()] = cur.getValue();
                }
            } else if (cur.isXType('combo')) {
                if (cur.getValue && cur.getValue()) {
                    result[cur.getName()] = cur.getValue();
                }
            } else if (cur.isXType('fieldset')) {
                if (cur.checkbox) {
                    //support for checkboxes in the fieldset title
                    result[cur.checkboxName] = !cur.collapsed;
                }
            } else if (cur.isXType('radiogroup')) {
                //a radiogroup is not a container. So cascade doesn't visit it... don't ask...
                var first = cur.items.get(0);
                result[first.getName()] = first.getGroupValue();
            } else if (cur.isXType('checkbox')) {
                result[cur.getName()] = cur.getValue();
            } else if (cur.getName) {
                if (cur.getValue && cur.getValue() != "") {
                    result[cur.getName()] = cur.getValue();
                }
            }
        }
        return true;
    });
    return result;
};

var randomString = function() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
};

var subString = function (str, config) {
    for (var prop in config) {
        str = str.replace(prop, config[prop]);
    }
    return str;
};

/**
 * Function: getFormPanel
 *
 * Return:
 * {Studio.MapfileMgr.MapfileForm} the parent form panel
 */
var getFormPanel = function(element) {
    if (!element.formPanel) {
        element.formPanel = element.findParentBy(function(parent) {
            return parent.isXType('studio.mm.mapfileform');
        });
    }
    return element.formPanel;
};

var validateIntArray = function(v) {
    if (!v.match(/^(\d+)(\s*\n*,\s*\n*(\d+))*$/)) {
        return OpenLayers.i18n("Invalid format, must be a list of numbers separated by colons");
    }
    return true;
};


var splitIntArray = function(txt) {
    var valuesTxt = txt.split(/\s*\n*,\s*\n*/);
    var result = [];
    for (var i = 0; i < valuesTxt.length; ++i) {
        result.push(parseFloat(valuesTxt[i]));
    }
    return result;
};