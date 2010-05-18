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

Studio.MapfileMgr.MapfileToFormVisitor = function(json, mapfileInterface) {
    function createStylePanel(json, geometryType) {
        var options = {mapfileInterface: mapfileInterface, geometryType: geometryType};
        if (geometryType == 'polygon') {
            if (json.outlinecolor) {
                return new Studio.MapfileMgr.StrokeStylePanel(options);
            } else {
                return new Studio.MapfileMgr.FillStylePanel(options);
            }

        } else if (geometryType == 'line') {
            return new Studio.MapfileMgr.StrokeStylePanel(options);

        } else {
            return new Studio.MapfileMgr.PointStylePanel(options);
        }
    }


    function rebuildStylePanels(classPanel) {
        classPanel.removeStylePanels();

        if (!json.styles) return;

        for (var i = 0; i < json.styles.length; ++i) {
            var cur = json.styles[i];
            var stylePanel = createStylePanel(cur, classPanel.geometryType);
            classPanel.addStylePanel(stylePanel);
            stylePanel.visitStyler(new Studio.MapfileMgr.MapfileToFormVisitor.Simple(cur));
        }
    }

    return {
        beginPanel: function(panel) {
            var panelType = panel.getXType() || panel.xtype;
            if (panelType.match(/^studio\.mm\..*propertiespanel$/)) {
                //nothing special to do
                return this;
            } else if (panelType == 'studio.mm.limitbyscale') {
                if (json.maxscaledenom || json.minscaledenom) {
                    panel.ownerCt.expand();
                    return new Studio.MapfileMgr.MapfileToFormVisitor.Simple(json);
                } else {
                    panel.ownerCt.collapse();
                    return null;
                }
            } else if (panelType == 'studio.mm.limitbycondition') {
                if (json.expression) {
                    panel.ownerCt.expand();
                    return new Studio.MapfileMgr.MapfileToFormVisitor.LimitByCondition(json.expression);
                } else {
                    panel.ownerCt.collapse();
                    return null;
                }
            } else if (panelType == 'studio.mm.labelstyle') {
                if (json.label) {
                    panel.ownerCt.expand();
                    return new Studio.MapfileMgr.MapfileToFormVisitor.Simple(json.label);
                } else {
                    panel.ownerCt.collapse();
                    return null;
                }
            } else if (panelType == 'studio.mm.bbox') {
                return new Studio.MapfileMgr.MapfileToFormVisitor.Simple(json[panel.jsonName]);
            } else if (panelType.match('style$')) {
                //other styles are rebuilt from scratch
                return null;
            } else if (panelType == 'studio.mm.wfsattributes') {
                if (json.metadata.gml_include_items) {
                    panel.ownerCt.expand();
                    return new Studio.MapfileMgr.MapfileToFormVisitor.WfsAttributes(json.metadata);
                } else {
                    panel.ownerCt.collapse();
                    return null;
                }

            } else {
                alert('Un-supported xtype: ' + panelType);
                return null;
            }
        },

        endPanel: function(panel) {
            var panelType = panel.getXType();
            if (panelType == 'studio.mm.classpropertiespanel') {
                rebuildStylePanels(panel);
            }
        },

        value: function(component, name, value) {
            return Studio.MapfileMgr.MapfileToFormVisitor.getValue(json, component, name);
        }
    };
};


Studio.MapfileMgr.MapfileToFormVisitor.getValue = function(json, component, name) {
    if (component.isXType('studio.mm.colorpickerfield') && json[name] != undefined) {
        var rgb = json[name];

        function toHex(val) {
            var result = parseInt(val).toString(16);
            if (result.length > 1) {
                return result;
            } else {
                return "0" + result;
            }
        }

        return "#" + toHex(rgb[0]) + toHex(rgb[1]) + toHex(rgb[2]);
    } else {
        return json[name];
    }
};

Studio.MapfileMgr.MapfileToFormVisitor.Simple = function(json) {
    return {
        beginPanel: function(panel) {
            return this;
        },

        endPanel: function(panel) {
        },

        value: function(component, name, value) {
            return Studio.MapfileMgr.MapfileToFormVisitor.getValue(json, component, name);
        }
    };
};

Studio.MapfileMgr.MapfileToFormVisitor.LimitByCondition = function(expression) {
    var regexpString = /^\(\s*"\[([^\]]+)\]"\s*([!=<>]*)\s*"([^"]*)"\s*\)$/;
    var regexpNumber = /^\(\s*\[([^\]]+)\]\s*([!=<>]*)\s*([0-9.e+-]+)\s*\)$/;
    var matches = regexpString.exec(expression);
    if (!matches) matches = regexpNumber.exec(expression);
    var exploded;
    if (!matches) {
        alert("Cannot parse expression: " + expression);
        exploded = {};
    } else {
        exploded = {
            column: matches[1],
            operator: matches[2],
            value: matches[3]
        };
    }

    return {
        beginPanel: function(panel) {
            return this;
        },

        endPanel: function(panel) {
        },

        value: function(component, name, value) {
            return Studio.MapfileMgr.MapfileToFormVisitor.getValue(exploded, component, name);
        }
    };
};

Studio.MapfileMgr.MapfileToFormVisitor.WfsAttributes = function(json) {
    return {
        beginPanel: function(panel) {
            return this;
        },

        endPanel: function(panel) {
        },

        value: function(component, name, value) {
            return Studio.MapfileMgr.MapfileToFormVisitor.getValue(json, component, name);
        }
    };
};
