/*
	storage.js
	Copyright © 2006, 2007, 2009  WOT Services Oy <info@mywot.com>

	This file is part of WOT.

	WOT is free software: you can redistribute it and/or modify it
	under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	WOT is distributed in the hope that it will be useful, but WITHOUT
	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
	or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
	License for more details.

	You should have received a copy of the GNU General Public License
	along with WOT. If not, see <http://www.gnu.org/licenses/>.
*/

var wot_hashtable =
{
	init: function()
	{
		try {
			if (this.bag) {
				return;
			}
			this.bag = Components.classes["@mozilla.org/hash-property-bag;1"].
						getService(Components.interfaces.nsIWritablePropertyBag);
		} catch (e) {
			dump("wot_hashtable.init: failed with: " + e + "\n");
		}

		window.addEventListener("unload", function(e) {
				wot_hashtable.unload(); }, false);
	},

	unload: function()
	{
		this.bag = null;
	},

	set: function(name, value)
	{
		try {
			this.bag.setProperty(name, value);
		} catch (e) {
			dump("wot_hashtable.set: failed with " + e + "\n");
		}
	},

	get: function(name)
	{
		try {
			return this.bag.getProperty(name);
		} catch (e) {
		}
		return null;
	},

	remove: function(name)
	{
		try {
			this.bag.deleteProperty(name);
		} catch (e) {
		}
	},

	get_enumerator: function(name)
	{
		try {
			return this.bag.enumerator;
		} catch (e) {
			dump("wot_hashtable.get_enumerator: failed with " + e + "\n");
		}
		return null;
	}
};

wot_hashtable.init();
