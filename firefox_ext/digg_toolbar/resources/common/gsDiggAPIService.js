/***** BEGIN LICENSE BLOCK *****

Copyright (c) 2008-2009, Digg Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.
* Neither the name of Digg Inc. nor the names of its contributors may be used to
endorse or promote products derived from this software without specific prior
written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***** END LICENSE BLOCK *****/

var EXPORTED_SYMBOLS = [];

const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/CM/gsCMManifest.js");
Cu.import("resource://glaxdigg/CM/gsCMCommunicationService.js");
Cu.import("resource://digg/common/gsDiggCommon.js");

// The Digg read API manifest.
const READ_MANIFEST = {
  methods: [
    // Containers.
    { mnemonic: "GET_ALL_CONTAINERS", entry_method: "container.getAll",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_CONTAINER", entry_method: "container.getInfo",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    // Topics.
    { mnemonic: "GET_ALL_TOPICS", entry_method: "topic.getAll",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_TOPIC", entry_method: "topic.getInfo",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    // Media.
    { mnemonic: "GET_ALL_MEDIA", entry_method: "media.getAll",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_MEDIA", entry_method: "media.getInfo",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    // Shorturls.
    { mnemonic: "CREATE_SHORT_URL", entry_method: "shorturl.create",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_SHORT_URL", entry_method: "shorturl.getInfo",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_RANDOM_SHORT_URL", entry_method: "shorturl.random",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    // Stories.
    { mnemonic: "GET_ALL_STORIES", entry_method: "story.getAll",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_STORY", entry_method: "story.getInfo",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_STORY_COMMENTS", entry_method: "story.getComments",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_STORY_DIGGS", entry_method: "story.getDiggs",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_HOT_STORIES", entry_method: "story.getHot",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_POPULAR_STORIES", entry_method: "story.getPopular",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_RELATED_STORIES", entry_method: "story.getRelated",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_TOP_STORIES", entry_method: "story.getTop",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_UPCOMING_STORIES", entry_method: "story.getUpcoming",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    // Users.
    { mnemonic: "GET_ALL_USERS", entry_method: "user.getAll",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_USER", entry_method: "user.getInfo",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_USER_COMMENTS", entry_method: "user.getComments",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_USER_DIGGS", entry_method: "user.getDiggs",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_USER_DUGG", entry_method: "user.getDugg",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_USER_FAVORITES", entry_method: "user.getFavorites",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_USER_SUBMISSIONS", entry_method: "user.getSubmissions",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    // Friends.
    { mnemonic: "GET_ALL_FRIENDS", entry_method: "friend.getAll",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_FRIEND_COMMENTS", entry_method: "friend.getCommented",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_FRIEND_DUGG", entry_method: "friend.getDugg",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
    { mnemonic: "GET_FRIEND_SUBMISSIONS", entry_method: "friend.getSubmissions",
      entry_point: "/1.0/endpoint", method: "GET", protocol: "http://" },
  ],
  domains: [
    { hostname: "services.digg.com" }
  ],
  fixed_parameters: [
    { name: "type",   value: "json"}
  ]
};

// The Digg Write API manifest.
const WRITE_MANIFEST = {
  methods: [
    // Stories.
    { mnemonic: "BURY_STORY", entry_method: "story.bury",
      entry_point: "/1.0/endpoint", method: "POST", protocol: "http://" },
    { mnemonic: "DIGG_STORY", entry_method: "story.digg",
      entry_point: "/1.0/endpoint", method: "POST", protocol: "http://" },
    // OAuth.
    { mnemonic: "GET_ACCESS_TOKEN", entry_method: "oauth.getAccessToken",
      entry_point: "/1.0/endpoint", method: "POST", protocol: "http://" },
    { mnemonic: "GET_REQUEST_TOKEN", entry_method: "oauth.getRequestToken",
      entry_point: "/1.0/endpoint", method: "POST", protocol: "http://" },
    { mnemonic: "VERIFY_TOKEN", entry_method: "oauth.verify",
      entry_point: "/1.0/endpoint", method: "POST", protocol: "http://" }
  ],
  domains: [
    { hostname: "services.digg.com" }
  ],
  fixed_parameters: []
};

/**
 * The API Service.
 */
GlaxDigg.Digg.APIService = {
  /* Logger. */
  _logger : null,

  /* Read API object. */
  _readAPI: null,
  /* Write API object. */
  _writeAPI: null,
  /* The last registered exception when trying to initialize the API object. */
  _lastException : null,

  // Observer topics.
  get TOPIC_API_CONNECTED() { return "gs-digg-api-connected"; },

  /**
   * Initialize the service.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.APIService");
    this._logger.trace("init");
  },

  /**
   * Initializes the service with the server manifest.
   * @return true if the object was properly initialized, false otherwise.
   */
  initialize : function() {
    this._logger.debug("initialize");

    let that = this;

    try {
      let readManifestObject = new GlaxDigg.CM.Manifest(READ_MANIFEST);
      let writeManifestObject = new GlaxDigg.CM.Manifest(WRITE_MANIFEST);

      this._readAPI =
        GlaxDigg.CM.CommunicationService.implementManifest(readManifestObject);
      this._writeAPI =
        GlaxDigg.CM.CommunicationService.implementManifest(
          writeManifestObject, true);

      GlaxDigg.ObserverService.notifyObservers(
        null, this.TOPIC_API_CONNECTED, true);
    } catch (e) {
      GlaxDigg.ObserverService.notifyObservers(
        null, this.TOPIC_API_CONNECTED, false);
      this._lastException = e;
      this._logger.error("An error occurred when generating the API.\n" + e);
    }
  },

  /**
   * Returns the read API object.
   * @return the read API object.
   * @throws Exception if the object hasn't been initialized properly yet.
   */
  get readAPI() {
    this._logger.debug("get readAPI");

    if (this._readAPI != null) {
      // nothing to do.
    } else if (this._lastException != null) {
      this._logger.error("The read API was requested after an error occurred.");
      throw this._lastException;
    } else {
      this._logger.error(
        "The read API was requested before it was initialized.");
      throw "The read API has not been initialized yet.";
    }

    return this._readAPI;
  },

  /**
   * Returns the write API object.
   * @return the write API object.
   * @throws Exception if the object hasn't been initialized properly yet.
   */
  get writeAPI() {
    this._logger.debug("get writeAPI");

    if (this._writeAPI != null) {
      // nothing to do.
    } else if (this._lastException != null) {
      this._logger.error(
        "The write API was requested after an error occurred.");
      throw this._lastException;
    } else {
      this._logger.error(
        "The write API was requested before it was initialized.");
      throw "The write API has not been initialized yet.";
    }

    return this._writeAPI;
  }
};

/**
 * Constructor
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.APIService);
