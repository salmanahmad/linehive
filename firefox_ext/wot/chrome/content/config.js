/*
	config.js
	Copyright © 2005, 2006, 2007, 2008, 2009  WOT Services Oy <info@mywot.com>

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

const WOT_PLATFORM = "firefox";
const WOT_VERSION  = "20091028";

/*
 * Constants
 */

const WOT_GUID = "{a0d7ccb3-214d-498b-b4aa-0e8fda9a7bf7}";

/* Reputation values */
const WOT_MAX_REPUTATION   = 100;
const WOT_MIN_REPUTATION_5 = 80;
const WOT_MIN_REPUTATION_4 = 60;
const WOT_MIN_REPUTATION_3 = 40;
const WOT_MIN_REPUTATION_2 = 20;

/* Confidence values */
const WOT_MAX_CONFIDENCE   = 100;
const WOT_MIN_CONFIDENCE_5 = 45;
const WOT_MIN_CONFIDENCE_4 = 34;
const WOT_MIN_CONFIDENCE_3 = 23;
const WOT_MIN_CONFIDENCE_2 = 12;
const WOT_MIN_CONFIDENCE_1 = 6;

/* Testimony values and rounding */
const WOT_TESTIMONY_QUICK_5 = WOT_MIN_REPUTATION_5;
const WOT_TESTIMONY_QUICK_4 = WOT_MIN_REPUTATION_4;
const WOT_TESTIMONY_QUICK_3 = WOT_MIN_REPUTATION_3;
const WOT_TESTIMONY_QUICK_2 = WOT_MIN_REPUTATION_2;
const WOT_TESTIMONY_QUICK_1 = 0;
const WOT_TESTIMONY_ROUND = 1; /* Testimony steps */
const WOT_MIN_COMMENT_DIFF = 35;

/* Applications */
const WOT_APPLICATIONS = 6;

/* API */
const WOT_SERVICE_NORMAL		= "http://api.mywot.com";
const WOT_SERVICE_SECURE		= "https://api.mywot.com";

const WOT_SERVICE_API_VERSION	= "/0.4/";
const WOT_SERVICE_UPDATE_FORMAT	= 3;

const WOT_SERVICE_API_LINK		= WOT_SERVICE_API_VERSION + "link";
const WOT_SERVICE_API_QUERY		= WOT_SERVICE_API_VERSION + "query";
const WOT_SERVICE_API_REGISTER	= WOT_SERVICE_API_VERSION + "register";
const WOT_SERVICE_API_RELOAD	= WOT_SERVICE_API_VERSION + "reload";
const WOT_SERVICE_API_SUBMIT	= WOT_SERVICE_API_VERSION + "submit";
const WOT_SERVICE_API_UPDATE    = WOT_SERVICE_API_VERSION + "update";

/* API XML tags and attributes */
const WOT_SERVICE_XML_LINK						= "link";
const WOT_SERVICE_XML_QUERY						= "query";
const WOT_SERVICE_XML_QUERY_NONCE				= "nonce";
const WOT_SERVICE_XML_QUERY_TARGET				= "target";
const WOT_SERVICE_XML_QUERY_TARGET_INDEX		= "index";
const WOT_SERVICE_XML_QUERY_APPLICATION			= "application";
const WOT_SERVICE_XML_QUERY_APPLICATION_NAME	= "name";
const WOT_SERVICE_XML_QUERY_APPLICATION_R		= "r";
const WOT_SERVICE_XML_QUERY_APPLICATION_C		= "c";
const WOT_SERVICE_XML_QUERY_APPLICATION_I		= "inherited";
const WOT_SERVICE_XML_QUERY_APPLICATION_L		= "lowered";
const WOT_SERVICE_XML_QUERY_APPLICATION_T		= "t";
const WOT_SERVICE_XML_QUERY_MSG					= "message";
const WOT_SERVICE_XML_QUERY_MSG_ID				= "id";
const WOT_SERVICE_XML_QUERY_MSG_ID_MAINT		= "downtime";
const WOT_SERVICE_XML_QUERY_MSG_TYPE			= "type";
const WOT_SERVICE_XML_QUERY_MSG_URL				= "url";
const WOT_SERVICE_XML_QUERY_MSG_TARGET			= "target";
const WOT_SERVICE_XML_QUERY_MSG_TARGET_ALL		= "all";
const WOT_SERVICE_XML_QUERY_MSG_VERSION			= "version";
const WOT_SERVICE_XML_QUERY_MSG_VERSION_EQ		= "eq";
const WOT_SERVICE_XML_QUERY_MSG_VERSION_LE		= "le";
const WOT_SERVICE_XML_QUERY_MSG_VERSION_GE		= "ge";
const WOT_SERVICE_XML_QUERY_MSG_THAN			= "than";
const WOT_SERVICE_XML_QUERY_USER				= "user";
const WOT_SERVICE_XML_QUERY_USER_ICON			= "icon";
const WOT_SERVICE_XML_QUERY_USER_BAR			= "bar";
const WOT_SERVICE_XML_QUERY_USER_LENGTH			= "length";
const WOT_SERVICE_XML_QUERY_USER_LABEL			= "label";
const WOT_SERVICE_XML_QUERY_USER_URL			= "url";
const WOT_SERVICE_XML_QUERY_USER_TEXT			= "text";
const WOT_SERVICE_XML_QUERY_USER_NOTICE			= "notice";
const WOT_SERVICE_XML_QUERY_STATUS				= "status";
const WOT_SERVICE_XML_QUERY_STATUS_LEVEL		= "level";
const WOT_SERVICE_XML_REGISTER					= "register";
const WOT_SERVICE_XML_REGISTER_ID				= "id";
const WOT_SERVICE_XML_REGISTER_KEY				= "key";
const WOT_SERVICE_XML_RELOAD					= "reload";
const WOT_SERVICE_XML_RELOAD_ID					= WOT_SERVICE_XML_REGISTER_ID;
const WOT_SERVICE_XML_RELOAD_KEY				= WOT_SERVICE_XML_REGISTER_KEY;
const WOT_SERVICE_XML_SUBMIT					= "submit";
const WOT_SERVICE_XML_SUBMIT_RESULT				= "result";
const WOT_SERVICE_XML_UPDATE_VERSION			= "version";
const WOT_SERVICE_XML_UPDATE_INTERVAL			= "interval";
const WOT_SERVICE_XML_UPDATE_SEARCH				= "search";
const WOT_SERVICE_XML_UPDATE_SEARCH_NAME		= "name";
const WOT_SERVICE_XML_UPDATE_SHARED				= "shared";
const WOT_SERVICE_XML_UPDATE_SHARED_DOMAINS		= "domains";
const WOT_SERVICE_XML_UPDATE_SHARED_LEVEL		= "level";

/* My */
const WOT_MY_URL = "http://www.mywot.com/";
const WOT_MY_COOKIE_DOMAIN = ".mywot.com";
const WOT_MY_TRIGGER = /^(.+\.)?mywot.com$/;
const WOT_MY_SESSION_LENGTH = 86340 * 1000; /* < 1d */

/* Scorecard */
const WOT_SCORECARD_PATH = "scorecard/";
const WOT_SCORECARD_COMMENT = "/comment";
const WOT_SCORECARD_RATE = "/rate";

/* Operation intervals (in ms) */
const WOT_DELAY_WARNING					= 1000;				/* 1 s */
const WOT_INTERVAL_BLOCK_ERROR			= 30 * 1000;		/* 30 s */
const WOT_INTERVAL_CACHE_REFRESH 	  	= 30 * 60 * 1000;	/* 30 min */
const WOT_INTERVAL_CACHE_REFRESH_BLOCK 	= 18000 * 1000;		/* 5 h */
const WOT_INTERVAL_CACHE_REFRESH_ERROR	= 5 * 60 * 1000;	/* 5 min */
const WOT_INTERVAL_REGISTER_ERROR 	  	= 60 * 1000;		/* 1 min */
const WOT_INTERVAL_REGISTER_OFFLINE	  	= 30 * 1000;		/* 30 s */
const WOT_INTERVAL_RELOAD_ERROR 	  	= 5 * 60 * 1000;	/* 5 min */
const WOT_INTERVAL_SUBMIT_ERROR 		= 5 * 60 * 1000;	/* 5 min */
const WOT_INTERVAL_UPDATE_CHECK		  	= 10800 * 1000;		/* 3 h */
const WOT_MIN_INTERVAL_UPDATE_CHECK		= 30 * 60 * 1000;	/* 30 min */
const WOT_MAX_INTERVAL_UPDATE_CHECK		= 3 * 86400 * 1000;	/* 3d */
const WOT_INTERVAL_UPDATE_ERROR		  	= 15 * 60 * 1000;	/* 15 min */
const WOT_INTERVAL_UPDATE_OFFLINE 	  	= 30 * 1000;		/* 30 s */
const WOT_TIMEOUT_QUERY 				= 15 * 1000;		/* 15 s */

/* Maximum number of attempts to access service */
const WOT_MAX_TRIES_SUBMIT = 30;

/* Maximum number of hostnames in a link query */
const WOT_MAX_LINK_PARAMS = 100;
const WOT_MAX_LINK_HOSTSLEN = 5000; /* Characters */

/* Parameters */
const WOT_LENGTH_WITNESS_ID   = 40;	/* Characters */
const WOT_LENGTH_WITNESS_KEY  = 40;

/* Warnings */
const WOT_MAX_WARNINGS = 100;
const WOT_DEFAULT_WARNING_LEVEL = 39;
const WOT_DEFAULT_MIN_CONFIDENCE_LEVEL = 8;

const WOT_BLOCK_LOADING = "chrome://wot/locale/loading.html";
const WOT_BLOCK_BLOCKED = "chrome://wot/locale/blocked.html";


/*
 * Preferences
 */

const WOT_PREF_PATH = "settings/";
const WOT_PREF_FORWARD_TAB_MATCH = 6;
const WOT_PREF_FORWARD = /^http(s)?\:\/\/(www\.)?mywot\.com\/([^\/]{2}(-[^\/]+)?\/)?settings(\/([^\/]+))?\/?$/;
const WOT_PREF_TRIGGER = /^http(s)?\:\/\/(www\.)?mywot\.com\/([^\/]{2}(-[^\/]+)?\/)?settings\/.+/;

const WOT_PREF = "weboftrust.";

/* Values */
const WOT_WARNING_NONE			= 0;
const WOT_WARNING_NOTIFICATION	= 1;
const WOT_WARNING_DOM			= 2;
const WOT_WARNING_BLOCK			= 3;

const WOT_REASON_RATING			= 1;
const WOT_REASON_TESTIMONY		= 2;

const WOT_SEARCH_TYPE_OPTIMIZED	= 0;
const WOT_SEARCH_TYPE_WORST		= 1;
const WOT_SEARCH_TYPE_APP0		= 2;

/* First run */
const WOT_FIRSTRUN_GUIDE = 1;


/* Preferences and defaults */
const wot_prefs_bool = [
	[ "accessible",					false ],
	[ "automatic_updates",			false ],
	[ "create_button",				true  ],
	[ "enabled",					true  ],
	[ "eula_accepted",				false ],
	[ "my_cookies",					true  ],
	[ "prefetch",					false ],
	[ "private_disable",			false ],
	[ "search_ignore_4",			true  ],
	[ "search_scripts",				true  ],
	[ "show_application_0",			true  ],
	[ "show_application_1",			true  ],
	[ "show_application_2",			true  ],
	[ "show_application_3",			false ],
	[ "show_application_4",			true  ],
	[ "show_application_5",			false ],
	[ "show_search_popup",			true  ],
	[ "use_search_level",			false ],
	[ "warning_unknown_0",			false ],
	[ "warning_unknown_1",			false ],
	[ "warning_unknown_2",			false ],
	[ "warning_unknown_3",			false ],
	[ "warning_unknown_4",			false ],
	[ "warning_unknown_5",			false ]
];

const wot_prefs_char = [
	[ "cookie_updated",				"0"	],
	[ "extension_id",				""	],
	[ "firstrun_guide",				"0"	],
	[ "last_message",				""	],
	[ "last_version",				""	],
	[ "norepsfor",					""	],
	[ "partner",					""	],
	[ "status_level",				""	],
	[ "update_checked",				"0"	],
	[ "update_version",				""	],
	[ "warning_opacity",			""	],
	[ "witness_id",					""	],
	[ "witness_key",				""	]
];

const wot_prefs_int = [
	[ "min_confidence_level",		WOT_DEFAULT_MIN_CONFIDENCE_LEVEL ],
	[ "popup_hide_delay",			1000 ],
	[ "popup_show_delay",			200 ],
	[ "search_level",				WOT_MIN_REPUTATION_4 ],
	[ "search_type",				WOT_SEARCH_TYPE_OPTIMIZED ],
	[ "update_interval",			WOT_INTERVAL_UPDATE_CHECK ],
	[ "warning_level_0",			WOT_DEFAULT_WARNING_LEVEL ],
	[ "warning_level_1",			WOT_DEFAULT_WARNING_LEVEL ],
	[ "warning_level_2",			WOT_DEFAULT_WARNING_LEVEL ],
	[ "warning_level_3",			WOT_DEFAULT_WARNING_LEVEL ],
	[ "warning_level_4",			0 ],
	[ "warning_level_5",			WOT_DEFAULT_WARNING_LEVEL ],
	[ "warning_type_0",				WOT_WARNING_DOM ],
	[ "warning_type_1",				WOT_WARNING_DOM ],
	[ "warning_type_2",				WOT_WARNING_DOM ],
	[ "warning_type_3",				WOT_WARNING_NONE ],
	[ "warning_type_4",				WOT_WARNING_NONE ],
	[ "warning_type_5",				WOT_WARNING_NONE ]
];

/* Search rules */
const WOT_SEARCH				= "search";
const WOT_SEARCH_DISPLAY		= "display";
const WOT_SEARCH_DYNAMIC		= "dynamic";
const WOT_SEARCH_ENABLED		= "enabled";
const WOT_SEARCH_IGN			= "ign";
const WOT_SEARCH_PRE			= "pre";
const WOT_SEARCH_PRE_MATCH		= "match";
const WOT_SEARCH_PRE_RE			= "re";
const WOT_SEARCH_PRESTYLE		= "prestyle";
const WOT_SEARCH_REMOVE			= "remove";
const WOT_SEARCH_SCRIPT			= "script";
const WOT_SEARCH_STYLE			= "style";
const WOT_SEARCH_URLIGN			= "urlign";
const WOT_SEARCH_URL			= "url";
const WOT_SEARCH_MATCH			= "match";
const WOT_SEARCH_MATCH_COND		= "condition";
const WOT_SEARCH_MATCH_DOC		= "document";
const WOT_SEARCH_MATCH_ELEM		= "element";
const WOT_SEARCH_CONTENT_ATTR	= "attribute";
const WOT_SEARCH_CONTENT_VALUE	= "value";
const WOT_SEARCH_CONTENT_NAME	= "name";
const WOT_SEARCH_CONTENT_RE		= "re";
const WOT_SEARCH_CONTENT_FLAGS	= "flags";
const WOT_SEARCH_TARGET			= "target";
const WOT_SEARCH_POPUP			= "popup";
