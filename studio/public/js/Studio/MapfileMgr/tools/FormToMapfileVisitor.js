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

Studio.MapfileMgr.FormToMapfileVisitor = function(json) {
    return {
        beginPanel: function(panel) {
            var panelType = panel.getXType() || panel.xtype;
            if (panelType == 'studio.mm.classpropertiespanel') {
                //styles will be rebuilt from scratch
                json.styles = [];
                return this;

            } else if (panelType.match(/^studio\.mm\..*propertiespanel/)) {
                //nothing special to do
                return this;

            } else if (panelType == 'studio.mm.limitbyscale') {
                if (!panel.ownerCt.collapsed) {
                    return new Studio.MapfileMgr.FormToMapfileVisitor.Simple(json);
                } else {
                    delete json.maxscaledenom;
                    delete json.minscaledenom;
                    return null;
                }

            } else if (panelType == 'studio.mm.limitbycondition') {
                if (!panel.ownerCt.collapsed) {
                    return new Studio.MapfileMgr.FormToMapfileVisitor.LimitByCondition(json, panel.layer);
                } else {
                    delete json.expression;
                    return null;
                }

            } else if (panelType == 'studio.mm.labelstyle') {
                if (!panel.ownerCt.collapsed) {
                    panel.ownerCt.expand();
                    if (!json.label) json.label = {};
                    if (!json.label.type) json.label.type = "truetype";
                    return new Studio.MapfileMgr.FormToMapfileVisitor.Simple(json.label);
                } else {
                    delete json.label;
                    return null;
                }

            } else if (panelType == 'studio.mm.bbox') {
                return new Studio.MapfileMgr.FormToMapfileVisitor.Simple(json[panel.jsonName]);

            } else if (panelType.match('style$')) {
                //other styles are rebuilt from scratch
                var curStyle = {};
                json.styles.push(curStyle);
                return new Studio.MapfileMgr.FormToMapfileVisitor.Simple(curStyle);

            } else if (panelType == 'studio.mm.wfsattributes') {
                if (!panel.ownerCt.collapsed) {
                    json.dump = true;
                    return new Studio.MapfileMgr.FormToMapfileVisitor.WfsAttributes(json);
                } else {
                    delete json.dump;
                    return null;
                }
            } else {
                alert('Un-supported xtype: ' + panelType);
                return null;
            }
        },

        endPanel: function(panel) {
        },

        value: function(component, name, value) {
            return Studio.MapfileMgr.FormToMapfileVisitor.updateValue(json, component, name, value);
        }
    };
};

Studio.MapfileMgr.FormToMapfileVisitor.updateValue = function(json, component, name, value) {
    if (value === "") {
        delete json[name];

    } else if (component.isXType('studio.mm.colorpickerfield')) {
        var hex = component.getHexValue();

        function toDec(val, pos) {
            return parseInt(val.substring(pos, pos + 2), 16);
        }

        json[name] = [toDec(hex, 1), toDec(hex, 3), toDec(hex, 5)];

    } else {
        json[name] = value;
    }
    return value;
};

Studio.MapfileMgr.FormToMapfileVisitor.Simple = function(json) {
    return {
        beginPanel: function(panel) {
            return this;
        },

        endPanel: function(panel) {
        },

        value: function(component, name, value) {
            return Studio.MapfileMgr.FormToMapfileVisitor.updateValue(json, component, name, value);
        }
    };
};

Studio.MapfileMgr.FormToMapfileVisitor.LimitByCondition = function(json, layer) {
    var exploded = {};


    return {
        beginPanel: function(panel) {
            return this;
        },

        endPanel: function(panel) {
        },

        value: function(component, name, value) {
            return Studio.MapfileMgr.FormToMapfileVisitor.updateValue(exploded, component, name, value);
        },

        destroy: function() {
            if (exploded.column !== "" && exploded.operator) {
                var columnType = Studio.getColumnType(layer, exploded.column);
                if (columnType == "string") {
                    json.expression = '("[' + exploded.column + ']"' + exploded.operator + '"' + exploded.value + '")';
                } else {
                    json.expression = '([' + exploded.column + ']' + exploded.operator + exploded.value + ')';
                }
            } else {
                delete json.expression;
            }
        }
    };
};

Studio.MapfileMgr.FormToMapfileVisitor.WfsAttributes = function(json) {
    var exploded = {};

    return {
        beginPanel: function(panel) {
            return this;
        },

        endPanel: function(panel) {
        },

        value: function(component) {
            exploded = component.getSelectedValues();
        },

        destroy: function() {
            if (!json.metadata) {
                json.metadata = {};
            }
            Ext.apply(json.metadata, exploded);
        }
    };
};
