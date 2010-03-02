/*
	pending.js
	Copyright © 2005, 2006, 2007, 2009  WOT Services Oy <info@mywot.com>

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

var wot_pending =
{
	store: function(name) /* host */
	{
		try {
			if (!wot_cache.iscached(name) ||
					!wot_cache.get(name, "pending")) {
				return false;
			}

			var data = wot_idn.utftoidn(name);

			if (!data) {
				return false;
			}

			for (var i = 0; i < WOT_APPLICATIONS; ++i) {
				data += " " + wot_cache.get(name, "testimony_" + i);
			}

			var pref = Date.now();

			if (wot_prefs.setChar("pending." + pref, data)) {
				dump("wot_pending.store: " + pref + ": " + data + "\n");
				return true;
			}

			wot_prefs.flush();
		} catch (e) {
			dump("wot_pending.store: failed with " + e + "\n");
		}

		return false;
	},

	clear: function(pref)
	{
		try {
			if (!pref || !pref.length) {
				return;
			}

			var base = "pending." + pref;

			if (!wot_prefs.getChar(base, null)) {
				return;
			}

			dump("wot_pending.clear: " + pref + "\n");
			wot_prefs.clear(base);
			wot_prefs.clear(base + ".submit");
			wot_prefs.clear(base + ".tries");
			wot_prefs.deleteBranch(base);
			wot_prefs.flush();
		} catch (e) {
			dump("wot_pending.clear: failed with " + e + "\n");
		}
	},

	parse: function(pref, data)
	{
		try {
			var m = /^([^\s]+)(.*)/.exec(data);

			if (!m || !m[1] || !m[2]) {
				dump("wot_pending.parse: invalid entry: " + pref + ": " +
					data + "\n");
				this.clear(pref);
				return null;
			}

			var rv = {
				target: m[1],
				testimonies: []
			};
			var values = m[2];

			for (var i = 0; i < WOT_APPLICATIONS; ++i) {
				m = /^\s*(-?\d+)(.*)/.exec(values);

				if (!m || m[1] == null || Number(m[1]) < 0) {
					rv.testimonies[i] = -1;
				} else {
					rv.testimonies[i] = Number(m[1]);

					if (rv.testimonies[i] > WOT_MAX_REPUTATION) {
						rv.testimonies[i] = WOT_MAX_REPUTATION;
					}
				}

				values = m[2];
			}

			dump("wot_pending.parse: " + pref + ": " + rv.target + "\n");
			return rv;
		} catch (e) {
			dump("wot_pending.parse: failed with " + e + "\n");
		}

		return null;
	},

	submit: function()
	{
		try {
			var branch = wot_prefs.ps.getBranch(WOT_PREF + "pending.");
			var children = branch.getChildList("", {});

			for (var i = 0; i < children.length; ++i) {
				var pref = children[i];

				if (!/^\d+$/.test(pref)) {
					continue;
				}

				var base = "pending." + pref;
				var data = wot_prefs.getChar(base, null);

				if (!data) {
					continue;
				}

				var submit = wot_prefs.getChar(base + ".submit", null);

				if (submit) {
					submit = Date.now() - Number(submit);
					if (submit < WOT_INTERVAL_SUBMIT_ERROR) {
						continue;
					}
				}

				var tries = wot_prefs.getChar(base + ".tries", null);

				if (tries) {
					tries = Number(tries);
					if (tries >= WOT_MAX_TRIES_SUBMIT) {
						this.clear(pref);
						continue;
					}
				} else {
					tries = 0;
				}

				if (!wot_prefs.setChar(base + ".submit", Date.now()) ||
						!wot_prefs.setChar(base + ".tries", tries + 1)) {
					continue;
				}

				var parsed = this.parse(pref, data);

				if (!parsed) {
					continue;
				}

				wot_api_submit.send(pref, parsed.target, parsed.testimonies);

				if (!wot_cache.iscached(parsed.target) ||
						wot_cache.get(parsed.target, "pending")) {
					continue;
				}

				for (var i = 0; i < WOT_APPLICATIONS; ++i) {
					if (parsed.testimonies[i] < 0) {
						continue;
					}

					wot_cache.set(parsed.target, "testimony_" + i,
						parsed.testimonies[i]);
				}
			}
		} catch (e) {
			dump("wot_pending.submit: failed with " + e + "\n");
		}
	}
};
