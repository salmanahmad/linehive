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

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://digg/common/gsDiggCommon.js");

// Story state constants.
const GS_DIGG_STORY_STATE_EMPTY = 0;
const GS_DIGG_STORY_STATE_NEW = 1;
const GS_DIGG_STORY_STATE_EXISTS = 2;
// Cache expiration time.
const GS_DIGG_CACHE_EXPIRATION_TIME = 2 * 60 * 1000; // 2 minutes.
// Cache preference key.
const GS_DIGG_PREF_CACHE_ENABLE = GlaxDigg.Digg.PREF_BRANCH + "cache.enabled";

/**
 * Story Session script object.
 */
GlaxChrome.Digg.StorySession = {
  /* Logger for this object. */
  _logger : null,
  /* IO service. */
  _ioService : null,
  /* Preference service */
  _preferenceService : null,
  /* Prompt service. */
  _promptService : null,
  /* String bundle. */
  _stringBundle : null,

  /* Cache. */
  _cache : null,
  /* Cache timer. */
  _cacheTimer : null,
  /* Current story. */
  _currentStory : null,
  /* Topic list.*/
  _topicList : new Array(),
  /* Container list.*/
  _containerList : new Array(),

  /* Story empty broadcaster. */
  _broadcastStoryEmpty : null,
  /* Story new broadcaster. */
  _broadcastStoryNew : null,
  /* Story exists broadcaster. */
  _broadcastStoryExists : null,

  /**
   * Returns the current story.
   * @return the current story.
   */
  get currentStory() {
    this._logger.debug("currentStory [get]");

    return this._currentStory;
  },

  /**
   * Sets the story state: empty, new or existing story.
   * @param aState the story state to be set.
   */
  set _storyState(aState) {
    this._logger.debug("_storyState [set]");

    this._broadcastStoryEmpty.collapsed = (aState == GS_DIGG_STORY_STATE_EMPTY);
    this._broadcastStoryNew.collapsed = (aState != GS_DIGG_STORY_STATE_NEW);
    this._broadcastStoryExists.collapsed =
      (aState != GS_DIGG_STORY_STATE_EXISTS);
  },

  /**
   * Initializes the object.
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxChrome.Digg.StorySession");
    this._logger.debug("init");

    this._ioService =
      Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    this._promptService =
      Cc["@mozilla.org/embedcomp/prompt-service;1"].
        getService(Ci.nsIPromptService);
    this._cacheTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
    this._stringBundle = document.getElementById("gs-digg-string-bundle");

    this._broadcastStoryEmpty =
      document.getElementById("gs-digg-broadcaster-story-empty");
    this._broadcastStoryNew =
      document.getElementById("gs-digg-broadcaster-story-new");
    this._broadcastStoryExists =
      document.getElementById("gs-digg-broadcaster-story-exists");

    this._cache = new Array();
    this._broadcastStoryEmpty.setAttribute("collapsed", true);
    this._broadcastStoryNew.setAttribute("collapsed", true);
    this._broadcastStoryExists.setAttribute("collapsed", true);

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.addObserver(GS_DIGG_PREF_CACHE_ENABLE, this, false);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);

    this._loadTopics();
    this._loadContainers();
    this._startCacheTimer();
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logger.debug("uninit");

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.removeObserver(GS_DIGG_PREF_CACHE_ENABLE, this);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);

    this._cacheTimer.cancel();
    this._cacheTimer = null;
    this._cache = null;
    this._currentStory = null;
    this._broadcastStoryEmpty = null;
    this._broadcastStoryNew = null;
    this._broadcastStoryExists = null;
  },

  /**
   * Loads the default topics.
   */
  _loadTopics : function() {
    this._logger.trace("_loadTopics");

    let that = this;
    let callback = function(aResults) {
      if (aResults && 0 < aResults.length) {
        for (let i = 0; i < aResults.length; i++) {
          that._topicList.push(aResults[i]);
        }
      }
    };

    try {
      GlaxDigg.Digg.ContainerService.listTopics(callback);
    } catch(e) {
      this._logger.error("_loadTopics:\n" + e);
    }
  },

  /**
   * Loads the default containers.
   */
  _loadContainers : function() {
    this._logger.trace("_loadContainers");

    let that = this;
    let callback = function(aResults) {
      if (aResults && 0 < aResults.length) {
        for (let i = 0; i < aResults.length; i++) {
          that._containerList.push(aResults[i]);
        }
      }
    };

    try {
      GlaxDigg.Digg.ContainerService.listContainers(callback);
    } catch(e) {
      this._logger.error("_loadContainers:\n" + e);
    }
  },

  /**
   * Verifies if a topic is valid.
   * @param aTopicName the topic name.
   * @return true if valid, false otherwise.
   */
  _isValidTopic : function(aTopicName) {
    this._logger.trace("_isValidTopic");

    let topicValid = false;
    let topicCount = this._topicList.length;

    for (let i = 0; i < topicCount; i++) {
      if (aTopicName == this._topicList[i].shortName) {
        topicValid = true;
        break;
      }
    }

    return topicValid;
  },

  /**
   * Verifies if a container is valid.
   * @param aContainerName the container name.
   * @return true if valid, false otherwise.
   */
  _isValidContainer : function(aContainerName) {
    this._logger.trace("_isValidContainer");

    let containerValid = false;
    let containerCount = this._containerList.length;

    for (let i = 0; i < containerCount; i++) {
      if (aContainerName == this._containerList[i].shortName) {
        containerValid = true;
        break;
      }
    }

    return containerValid;
  },

  /**
   * Gets the URI object of the specify URL.
   * @param aURL the URL to convert to URI
   * @return the URI object.
   */
  _getURI : function(aURL) {
    this._logger.trace("_getURI");

    let uri = null;

    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(aURL)) {
      try {
        uri = this._ioService.newURI(aURL, null, null);
      } catch (e) {
        aURL = "http://" + aURL;
        uri = this._ioService.newURI(aURL, null, null);
      }
    }

    return uri;
  },

  /**
   * Verifies is the URI is valid.
   * @param aURI the URI to examine.
   * @return true if its valid, false otherwise.
   */
  _isValidURI : function(aURI) {
    this._logger.trace("_isValidURI");

    let isValid = false;

    if (aURI) {
      let scheme = String(aURI.scheme);

      isValid = (0 <= scheme.indexOf("http"));
    }

    return isValid;
  },

  /**
   * Verifies if the URI is a valid digg URL.
   * @param aURI the URI to examine.
   * @return True if it is valid, false otherwise.
   */
  _isValidDiggURI : function(aURI) {
    this._logger.trace("_isValidDiggURI");

    return (aURI.host.match(/digg\.com/gi));
  },

  /**
   * Handles the location change event.
   * @param aURL The URL that has just been loaded.
   */
  handleLocationChanged : function(aURL) {
    this._logger.debug("handleLocationChanged");

    let uri = this._getURI(aURL);

    this._currentStory = null;
    this._storyState = GS_DIGG_STORY_STATE_EMPTY;

    if (this._isValidURI(uri)) {
      let cacheStory = this._cache[aURL];
      let cacheIsEnabled =
         GlaxDigg.Application.prefs.get(GS_DIGG_PREF_CACHE_ENABLE).value;

      if (cacheIsEnabled && null != cacheStory) {
        this.loadStoryFromCache(aURL);
      } else {
        if (this._isValidDiggURI(uri)) {
          this._getStoryFromDiggURL(aURL, uri);
        } else {
          this._getStoryByURL(aURL);
        }
      }
    }
  },

  /**
   * Gets a story object from its link URL calling the API.
   * @param aURL the URL used to obtain the story.
   */
  _getStoryByURL : function(aURL) {
    this._logger.trace("_getStoryByURL");

    let that = this;
    let callback = function(aResult) {
      that._loadStoryFromServer(aResult, aURL, false, null);
    };

    try {
      GlaxDigg.Digg.StoryService.getStoryByURL(aURL, callback);
    } catch (e) {
      this._logger.error("_getStoryByURL:\n" + e);
    }
  },

  /**
   * Gets a story object from a digg url calling the API.
   * @param aURL the URL used to obtain the story.
   * @param aURI the URI used to obtain the story.
   */
  _getStoryFromDiggURL : function(aURL, aURI) {
    this._logger.trace("_getStoryFromDiggURL");

    let urlPath = this._getURICleanPath(aURI);
    let pathArray = urlPath.split('/');

    if (1 == pathArray.length) {
      let shortUrl = this._getURLShortURL(urlPath);

      this._getStoryByShortURL(aURL, shortUrl);
    } else if (2 == pathArray.length) {
      let title = this._getURLCleanTitle(pathArray);

      this._getStoryByTitle(aURL, title);
    }
  },

  /**
   * Gets a story object from its link title calling the API.
   * @param aURL the URL used to obtain the story.
   * @param aTitle the URL clean title.
   */
  _getStoryByTitle : function(aURL, aTitle) {
    this._logger.trace("_getStoryByTitle");

    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(aTitle)) {
      let that = this;
      let callback = function(aResult) {
        that._loadStoryFromServer(aResult, aURL, true, null);
      };

      try {
        GlaxDigg.Digg.StoryService.getStoryByTitle(aTitle, callback);
      } catch (e) {
        this._logger.error("_getStoryByTitle:\n" + e);
      }
    }
  },

  /**
   * Gets a story object from its short url calling the API.
   * @param aURL the URL used to obtain the story.
   * @param aShortURL the short url of the story.
   */
  _getStoryByShortURL : function(aURL, aShortURL) {
    this._logger.trace("_getStoryByShortURL");

    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(aShortURL)) {
      let that = this;
      let callback = function(aResult) {
        that._loadStoryFromServer(aResult, aURL, false, aShortURL);
      };

      try {
        GlaxDigg.Digg.StoryService.getStoryByShortURL(aShortURL, callback);
      } catch (e) {
        this._logger.error("_getStoryByShortURL:\n" + e);
      }
    }
  },

  /**
   * Gets the uri clean path, without slashes and parameters.
   * @param aURI the uri object.
   * @return the clean path.
   */
  _getURICleanPath : function(aURI) {
    this._logger.trace("_getURICleanPath");

    let path = aURI.path;
    let paramsSeparator = path.indexOf("?");

    if (-1 != paramsSeparator) {
      path = path.substring(0, paramsSeparator); // remove params.
    }
    path = path.replace(/^\/+/g, ''); // remove initial slashes.
    path = path.replace(/\/+$/g, ''); // remove trailing slashes.

    return path;
  },

  /**
   * Gets the url short url if its a Digg link.
   * @param aCleanPath the url clean path.
   * @return the short url if exists.
   */
  _getURLShortURL : function(aCleanPath) {
    this._logger.trace("_getURLShortURL");

    let shortUrl = null;
    let shortUrlRegExp = new RegExp("^(\d|\u)[a-zA-Z0-9]{2,10}$", "i");

    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(aCleanPath) &&
        !this._isValidContainer(aCleanPath) &&
        !this._isValidTopic(aCleanPath) &&
        shortUrlRegExp.test(aCleanPath)) {
      shortUrl = aCleanPath;
    }

    return shortUrl;
  },

  /**
   * Gets the url clean title if its a Digg permalink.
   * @param aPathArray the splitted path.
   * @return the clean title if exists.
   */
  _getURLCleanTitle : function(aPathArray) {
    this._logger.trace("_getURLCleanTitle");

    let title = null;
    let topic = aPathArray[0];

    if (this._isValidTopic(topic) &&
        !GlaxDigg.Util.UtilityService.isNullOrEmpty(aPathArray[1])) {
      title = aPathArray[1];
    }

    return title;
  },

  /**
   * Gets the related stories from server.
   * @param aURL the cache key url.
   * @param aStory the current story.
   */
  _getRelatedStories : function(aURL, aStory) {
    this._logger.trace("_getRelatedStories");

    let that = this;
    let toolbar = GlaxChrome.Digg.Toolbar;
    let cacheIsEnabled =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_CACHE_ENABLE).value;
    let callback1 = function(aResults) {
      toolbar.fillRelatedPopup("keywords", aResults);

      if (cacheIsEnabled) {
        that._cache[aURL].relatedByKeywords = aResults;
      }
    };
    let callback2 = function(aResults) {
      toolbar.fillRelatedPopup("source", aResults);

      if (cacheIsEnabled) {
        that._cache[aURL].relatedBySource = aResults;
      }
    };
    let callback3 = function(aResults) {
      toolbar.fillRelatedPopup("diggs", aResults);

      if (cacheIsEnabled) {
        that._cache[aURL].relatedByDiggs = aResults;
      }
    };

    GlaxDigg.Digg.StoryService.listRelatedStories(
      aStory.storyId, "keywords", callback1);
    GlaxDigg.Digg.StoryService.listRelatedStories(
      aStory.storyId, "source", callback2);
    GlaxDigg.Digg.StoryService.listRelatedStories(
      aStory.storyId, "diggs", callback3);
  },

  /**
   * Loads the story in the browser.
   * @param aStory the result story.
   * @param aURL the loaded url.
   * @param aPermalink true if is a digg permalink, false otherwise.
   * @param aShortURL the digg short url if exists, null otherwise.
   */
  _loadStoryFromServer : function(aStory, aURL, aPermalink, aShortURL) {
    this._logger.trace("_loadStoryFromServer");

    let cacheIsEnabled =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_CACHE_ENABLE).value;

    if (aStory) {
      this._currentStory = aStory;
      this._storyState = GS_DIGG_STORY_STATE_EXISTS;

      GlaxChrome.Digg.Overlay.loadStory(aStory);
      GlaxChrome.Digg.Toolbar.loadStory(aStory);

      if (cacheIsEnabled) {
        this._cache[aURL] = {
          story: aStory,
          time: (new Date()).getTime(),
          permalink: aPermalink,
          shortUrl : aShortURL
        };
      }

      this._getRelatedStories(aURL, aStory);
    } else {
      if (!aPermalink) {
        this._storyState = GS_DIGG_STORY_STATE_NEW;
      }

      if (cacheIsEnabled) {
        this._cache[aURL] = {
          story: null,
          time: (new Date()).getTime(),
          permalink: aPermalink,
          shortUrl : aShortURL
        };
      }
    }
  },

  /**
   * Loads the story in the browser.
   * @param aURL the story key url.
   */
  loadStoryFromCache: function(aURL) {
    this._logger.debug("loadStoryFromCache");

    let cacheStory = this._cache[aURL];

    if (cacheStory) {
      let story = cacheStory.story;

      if (story) {
        let relatedByKeywords = cacheStory.relatedByKeywords;
        let relatedBySource = cacheStory.relatedBySource;
        let relatedByDiggs = cacheStory.relatedByDiggs;

        this._currentStory = story;
        this._storyState = GS_DIGG_STORY_STATE_EXISTS;

        GlaxChrome.Digg.Overlay.loadStory(story);
        GlaxChrome.Digg.Toolbar.loadStory(story);
        GlaxChrome.Digg.Toolbar.fillRelatedPopup("keywords", relatedByKeywords);
        GlaxChrome.Digg.Toolbar.fillRelatedPopup("source", relatedBySource);
        GlaxChrome.Digg.Toolbar.fillRelatedPopup("diggs", relatedByDiggs);
      } else {
        if (!cacheStory.permalink) {
          this._storyState = GS_DIGG_STORY_STATE_NEW;
        }
      }
    }
  },

  /**
   * Updates the story in the cache for an url.
   * @param aURL the story key url to be updated.
   * @param aStory the story to be updated.
   */
  updateCacheStory : function(aURL, aStory) {
    this._logger.debug("updateCacheStory");

    if (this._cache[aURL]) {
      this._cache[aURL].story = aStory;
    }
  },

  /**
   * Opens the current story's permalink.
   * @param aTrackingCode the Digg tracking code to be appended to the URL.
   */
  openStory : function(aTrackingCode) {
    this._logger.debug("openStory");

    let url = (null == this._currentStory ? null : this._currentStory.href);

    if (null != url) {
      GlaxChrome.Digg.Overlay.openURL(url, aTrackingCode);
    }
  },

  /**
   * Gets the story short url.
   * @param aURL the url.
   * @param aCallback the callback method.
   */
  getStoryShortURL : function(aURL, aCallback) {
    this._logger.debug("getStoryShortURL");

    if (null == this._currentStory) {
      GlaxDigg.Digg.StoryService.getShortURL(aURL, aCallback);
    } else {
      aCallback(this._currentStory.shortUrl, this._currentStory.title);
    }
  },

  /**
   * Gets the short url of the current url.
   * @param aURL the current url.
   * @return the short url if exists.
   */
  getShortURLFromURL : function(aURL) {
    this._logger.debug("getShortURLFromURL");

    let shortUrl = null;
    let uri = this._getURI(aURL);

    if (this._isValidURI(uri) && this._isValidDiggURI(uri)) {
      let cleanPath = this._getURICleanPath(uri);

      if (null != cleanPath) {
        shortUrl = this._getURLShortURL(cleanPath);
      }
    }

    return shortUrl;
  },

  /**
   * Deletes the expire stories in the cache.
   */
  _deleteExpireStoriesInCache : function() {
    this._logger.trace("_deleteExpireStoriesInCache");

    let validTime = null;
    let storyTime = null;

    for (let storyUrl in this._cache) {
      storyTime = this._cache[storyUrl].time;
      validTime = (new Date()).getTime() - GS_DIGG_CACHE_EXPIRATION_TIME;

      if (validTime > storyTime) {
        delete this._cache[storyUrl];
      }
    }
  },

  /**
   * Starts the cache timer to eliminate stories with more than some minutes.
   */
  _startCacheTimer : function() {
    this._logger.trace("_startCacheTimer");

    let that = this;

    this._cacheTimer.cancel();
    this._cacheTimer.initWithCallback({
      notify: function(aTimer) { that._deleteExpireStoriesInCache(); }
    }, GS_DIGG_CACHE_EXPIRATION_TIME, Ci.nsITimer.TYPE_REPEATING_SLACK);
  },

  /**
   * Stops the cache timer.
   */
  _stopCacheTimer : function() {
    this._logger.trace("_stopCacheTimer");

    this._cache.splice(0, this._cache.length);
    this._cacheTimer.cancel();
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe: function(aSubject, aTopic, aData) {
    this._logger.debug("observe");

    if ("nsPref:changed" == aTopic && GS_DIGG_PREF_CACHE_ENABLE == aData) {
      let cacheIsEnabled =
        GlaxDigg.Application.prefs.get(GS_DIGG_PREF_CACHE_ENABLE).value;

      if (cacheIsEnabled) {
        this._startCacheTimer();
      } else {
        this._stopCacheTimer();
      }
    }
  }
};

window.addEventListener(
  "load", function() { GlaxChrome.Digg.StorySession.init(); }, false);
window.addEventListener(
  "unload", function() { GlaxChrome.Digg.StorySession.uninit(); }, false);
