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

Ext.namespace('Studio', 'Studio.data');

/**
 * Class: Studio.data.MapfileRecord
 *
 * A record containing a mapfile and some info about it.
 */
Studio.data.MapfileRecord = Ext.data.Record.create([
    {name: 'name'},
    {name: 'id'},
    {name: 'url', mapping: 'href'},  //the REST URL for getting the MapFile content
    {name: 'wmsurl'},   //the URL for the WMS
    {name: 'wmsproxyurl'}   //the URL for the WMS proxy
]);

/**
 * APIMethod: getInterface
 *
 * Returns:
 * {Studio.interface.MapfileInterface} The mapfileInterface object. 
 */
Studio.data.MapfileRecord.prototype.getInterface = function() {
    if (!this.interface) {
        this.interface = new Studio.interface.MapfileInterface(this);
    }
    return this.interface;
};


