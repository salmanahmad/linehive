/*
	extapi.js
	Copyright © 2008, 2009  WOT Services Oy <info@mywot.com>

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

function wot_extapi()
{
}

wot_extapi.prototype =
{
	/* Public constants */
	STATUS_EXCELLENT:		2,
	STATUS_GOOD:			1,
	STATUS_UNTRUSTED:		0,
	STATUS_UNAVAILABLE:		-1,
	STATUS_AGAIN:			-2,

	/* Internal constants */
	__STATUS_INPROGRESS:	-3,
	__POLL_TIMEOUT:			500,

	/* Internal methods */
	__istrusted: function(target)
	{
		try {
			var rv = this.STATUS_EXCELLENT;

			for (var i = 0; i < 3; ++i) {
				if (wot_cache.isok(target)) {
					var t = wot_cache.get(target, "testimony_"  + i);

					if (t >= 0) {
						if (t < WOT_MIN_REPUTATION_4) {
							return this.STATUS_UNTRUSTED;
						} else if (t < WOT_MIN_REPUTATION_5) {
							rv = this.STATUS_GOOD;
						}
					}
				}

				var r = wot_cache.get(target, "reputation_" + i);
				var c = wot_cache.get(target, "confidence_" + i);

				if (r < WOT_MIN_REPUTATION_4 || c < WOT_MIN_CONFIDENCE_1) {
					return this.STATUS_UNTRUSTED;
				} else if (r < WOT_MIN_REPUTATION_5) {
					rv = this.STATUS_GOOD;
				}
			}

			return rv;
		} catch (e) {
			dump("wot_extapi.__istrusted: failed with " + e + "\n");
		}

		return this.STATUS_UNAVAILABLE;
	},

	__getcachedstatus: function(target)
	{
		try {
			if (wot_cache.iscached(target)) {
				if (wot_cache.get(target, "inprogress")) {
					return this.__STATUS_INPROGRESS;
				}

				var cs = wot_cache.get(target, "status");

				if (cs == WOT_QUERY_OK || cs == WOT_QUERY_LINK) {
					return this.__istrusted(target);
				} else if (cs == WOT_QUERY_ERROR &&
						(Date.now() - wot_cache.get(target, "time")) <
							WOT_INTERVAL_CACHE_REFRESH_ERROR) {
					return this.STATUS_UNAVAILABLE;
				}
			}

			return this.STATUS_AGAIN;
		} catch (e) {
			dump("wot_extapi.__getcachedstatus: failed with " + e + "\n");
		}

		return this.STATUS_UNAVAILABLE;
	},

	__pollstatus: function(target, callback)
	{
		try {
			/* Ratings are being fetched, poll the cache until the
			 	request completes */
			if (typeof(callback) == "function") {
				window.setTimeout(function(instance) {
						instance.getstatus(target, callback);
					}, this.__POLL_TIMEOUT, this);
			}

			return this.STATUS_AGAIN;
		} catch (e) {
			dump("wot_extapi.__pollstatus: failed with " + e + "\n");
		}

		return this.STATUS_UNAVAILABLE;
	},

	__docallback: function(rv, callback)
	{
		try {
			if (typeof(callback) == "function") {
				callback(rv);
			}
		} catch (e) {
			dump("wot_extapi.__docallback: failed with " + e + "\n");
		}
	},

	/* Public functions */
	getstatus: function(target, callback)
	{
		try {
			var rv = this.STATUS_UNAVAILABLE;
			var hostname = target;

			/* Verify target, parse hostname if necessary */
			if (target) {
				if (target.indexOf("/") >= 0) {
					hostname = wot_url.gethostname(target);
				}
				if (hostname && !wot_url.isprivate(hostname)) {
					rv = this.STATUS_AGAIN;
				}
			}

			if (rv == this.STATUS_UNAVAILABLE) {
				return rv;
			}

			/* Make sure the current ratings are updated */
			wot_core.update();
			rv = this.__getcachedstatus(hostname);

			if (rv == this.__STATUS_INPROGRESS) {
				return this.__pollstatus(target, callback);
			}

			/* Request missing ratings */
			if (rv == this.STATUS_AGAIN && 
					!wot_api_query.send(hostname, function() {
							/* Called when request completes */
							var s = this.__getcachedstatus(hostname);
							if (s == this.STATUS_AGAIN) {
								s = this.STATUS_UNAVAILABLE;
							}
							this.__docallback(s, callback);
						})) {
				return this.STATUS_UNAVAILABLE;
			}
		
			this.__docallback(rv, callback);
			return rv;
		} catch (e) {
			dump("wot_extapi.getstatus: failed with " + e + "\n");
		}

		return this.STATUS_UNAVAILABLE;
	},

	updatesearch: function(content)
	{
		try {
			wot_search.process(content);
		} catch (e) {
			dump("wot_extapi.refreshpage: failed with " + e + "\n");
		}
	}
};
