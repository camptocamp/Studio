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

Studio.MapfileMgr.MapfilePanel = Ext.extend(Ext.Panel, {
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
            Studio.MapfileMgr.MapfilePanel.visitItems(this, subVisitor);
            if (subVisitor.destroy) subVisitor.destroy();
        }
        visitor.endPanel(this);
    }
});

/**
 * Function: visitItems
 *
 * Visit the widget structure for filling the mapfile (for example).
 *
 * Parameters:
 * visitor - {Object} the visitor to call
 */
Studio.MapfileMgr.MapfilePanel.visitItems = function(container, visitor) {
    container.items.each(function(item) {
        if (item.visitStyler) {
            item.visitStyler(visitor);
        } else {
            var oldValue, newValue;
            if (item.isXType('combo')) {
                if (item.getValue) {
                    // don't re-set value if it didn't change
                    oldValue = item.getValue();
                    newValue = visitor.value(item, item.getName() || item.name, oldValue);
                    if (oldValue != newValue) {
                        item.setValue(newValue);
                    }
                }

            } else if (item.isXType('fieldset')) {
                if (item.checkbox && item.checkboxName) {
                    //support for checkboxes in the fieldset title
                    oldValue = !item.collapsed;
                    newValue = visitor.value(item, item.checkboxName, oldValue);
                    if (oldValue != newValue) {
                        if (newValue) {
                            item.expand(false);
                        } else {
                            item.collapse(false);
                        }
                    }
                }

            } else if (item.isXType('radiogroup')) {
                //a radiogroup is not a container. So cascade doesn't visit it... don't ask...
                var first = item.items.get(0);
                visitor.value(item, first.getName(), first.getGroupValue());
                //TODO: set the value
                alert("radiogroup not yet implemented");

            } else if (item.getName && item.getValue) {
                var name = item.getName() || item.name;
                if (name) {
                    // don't re-set value if it didn't change
                    oldValue = item.getValue();
                    newValue = visitor.value(item, name, oldValue);
                    if (oldValue != newValue) {
                        item.setValue(newValue);
                    }
                }
            }

            if (item.isXType('container') && item.items) {
                Studio.MapfileMgr.MapfilePanel.visitItems(item, visitor);
            }
        }
    });
};
Ext.reg('studio.mm.mapfilepanel', Studio.MapfileMgr.MapfilePanel);

