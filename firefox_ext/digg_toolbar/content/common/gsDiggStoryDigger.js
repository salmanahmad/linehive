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

/**
 * Story Digger script object.
 */
GlaxChrome.Digg.StoryDigger = {
  /* Logger for this object. */
  _logger : null,
  /* Preference service */
  _preferenceService : null,
  /* Prompt service. */
  _promptService : null,
  /* String bundle. */
  _stringBundle : null,

  /* Pending digg story array. */
  _pendingDiggStoryList : [],
  /* User dugg stories array. */
  _userDuggStories : new Array(),

  /**
   * Initializes the object.
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxChrome.Digg.StoryDigger");
    this._logger.debug("init");

    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    this._promptService =
      Cc["@mozilla.org/embedcomp/prompt-service;1"].
        getService(Ci.nsIPromptService);
    this._stringBundle = document.getElementById("gs-digg-string-bundle");

    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_API_CONNECTED, false);
    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_AUTHORIZE_ERROR, false);
    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_REAUTHORIZE, false);
    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_DONE, false);
    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_ALREADY_DUGG,
      false);
    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_ERROR, false);

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.addObserver(GS_DIGG_PREF_USER_NAME, this, false);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);

    this._loadDuggStories();
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logger.debug("uninit");

    GlaxDigg.ObserverService.removeObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_API_CONNECTED);
    GlaxDigg.ObserverService.removeObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_AUTHORIZE_ERROR);
    GlaxDigg.ObserverService.removeObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_REAUTHORIZE);
    GlaxDigg.ObserverService.removeObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_DONE);
    GlaxDigg.ObserverService.removeObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_ALREADY_DUGG);
    GlaxDigg.ObserverService.removeObserver(
      this, GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_ERROR);

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.removeObserver(GS_DIGG_PREF_USER_NAME, this);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);
  },

  /**
   * Loads the user dugg stories.
   */
  _loadDuggStories : function() {
    this._logger.trace("_loadDuggStories");

    let username = GlaxDigg.Application.prefs.get(GS_DIGG_PREF_USER_NAME).value;

    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(username)) {
      let that = this;
      let callback = function(aResults) {
        that._userDuggStories.splice(0, that._userDuggStories.length);
        for (let i = 0; i < aResults.length; i++) {
          that._userDuggStories.push(aResults[i].storyId);
        }
      };

      GlaxDigg.Digg.StoryService.listUserDuggStories(username, callback);
    } else {
      this._userDuggStories.splice(0, this._userDuggStories.length);
    }
  },

  /**
   * Checks if a story has already been dugg.
   * @param aStoryId the story id.
   * @return true if the story has been dugg, false otherwise.
   */
  checkIfStoryHasBeenDugg : function(aStoryId) {
    this._logger.debug("checkIfStoryHasBeenDugg");

    let storyDugg = false;
    let storyCount = this._userDuggStories.length;

    for (let i = 0; i < storyCount; i++) {
      if (aStoryId == this._userDuggStories[i]) {
        storyDugg = true;
        break;
      }
    }

    return storyDugg;
  },

  /**
   * Diggs a story directly in the API.
   * @param aStoryId the story id.
   * @param aCallback the callback method.
   */
  diggStory : function(aStoryId, aCallback) {
    this._logger.debug("diggStory");

    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(aStoryId)) {
      this._pendingDiggStoryList[aStoryId] = aCallback;

      if (GlaxDigg.Digg.WritableAPIService.isConnected) {
        GlaxDigg.Digg.WritableAPIService.diggStory(aStoryId);
      } else {
        GlaxDigg.Digg.WritableAPIService.getRequestToken(aStoryId);
      }
    }
  },

  /**
   * Handles the api connected event, resend all pending story ids.
   */
  _handleAPIConnected : function() {
    this._logger.trace("_handleAPIConnected");

    for (let storyId in this._pendingDiggStoryList) {
      GlaxDigg.Digg.WritableAPIService.diggStory(storyId);
    }
  },

  /**
   * Handles the digg authorize error.
   * @param aStoryId the story id.
   */
  _handleDiggAuthorizeError : function(aStoryId) {
    this._logger.trace("_handleDiggAuthorizeError");

    let message =
      this._stringBundle.getString(
        "gs.digg.storyDigger.authorizeError.message");

    this._handleCallback(aStoryId, false, false);
    this._showMessage(message);
  },

  /**
   * Handles the digg reauthorize to reconnect.
   * @param aStoryId the story id.
   */
  _handleDiggReauthorize : function(aStoryId) {
    this._logger.trace("_handleDiggReauthorize");

    let message =
      this._stringBundle.getString("gs.digg.storyDigger.reconnect.message");

    this._handleCallback(aStoryId, false, false);
    this._showMessage(message);
  },

  /**
   * Handles the successful response of digging a story id.
   * @param aStoryId the story id.
   */
  _handleDiggStoryDone : function(aStoryId) {
    this._logger.trace("_handleDiggStoryDone");

    this._userDuggStories.push(aStoryId);
    this._handleCallback(aStoryId, true, true);
  },

  /**
   * Handles the error response when a story id was already dugg.
   * @param aStoryId the story id.
   */
  _handleDiggStoryAlreadyDugg : function(aStoryId) {
    this._logger.trace("_handleDiggStoryAlreadyDugg");

    let message =
      this._stringBundle.getString("gs.digg.storyDigger.alreadyDugg.message");

    this._userDuggStories.push(aStoryId);
    this._handleCallback(aStoryId, true, false);
    this._showMessage(message);
  },

  /**
   * Handles the error response of digging a story id.
   * @param aStoryId the story id.
   */
  _handleDiggStoryError : function(aStoryId) {
    this._logger.trace("_handleDiggStoryError");

    let message =
      this._stringBundle.getString("gs.digg.storyDigger.diggError.message");

    this._handleCallback(aStoryId, false, false);
    this._showMessage(message);
  },

  /**
   * Shows a message.
   * @param aMessage the message.
   */
  _showMessage : function(aMessage) {
    this._logger.trace("_showMessage");

    let title = this._stringBundle.getString("gs.digg.storyDigger.digg.title");

    this._promptService.alert(null, title, aMessage);
  },

  /**
   * Handles the callback.
   * @param aStoryId the story id.
   * @param aSuccess true if success, false otherwise.
   * @param aIncreaseDigg true if have to increase the diggs, false otherwise.
   */
  _handleCallback : function(aStoryId, aSuccess, aIncreaseDigg) {
    this._logger.trace("_handleCallback");

    let callback = this._pendingDiggStoryList[aStoryId];

    if (null != callback) {
      callback(aSuccess, aIncreaseDigg);
      delete this._pendingDiggStoryList[aStoryId];
    }
  },

  /**
   * Observes any changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logger.debug("observe");

    switch (aTopic) {
      case GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_API_CONNECTED:
        this._handleAPIConnected();
        break;
      case GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_AUTHORIZE_ERROR:
        this._handleDiggAuthorizeError(aData);
        break;
      case GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_REAUTHORIZE:
        this._handleDiggReauthorize(aData);
        break;
      case GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_DONE:
        this._handleDiggStoryDone(aData);
        break;
      case GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_ALREADY_DUGG:
        this._handleDiggStoryAlreadyDugg(aData);
        break;
      case GlaxDigg.Digg.WritableAPIService.TOPIC_DIGG_STORY_ERROR:
        this._handleDiggStoryError(aData);
        break;
      case "nsPref:changed":
        if (GS_DIGG_PREF_USER_NAME == String(aData)) {
          this._loadDuggStories();
        }
        break;
    }
  }
};

window.addEventListener(
  "load", function() { GlaxChrome.Digg.StoryDigger.init(); }, false);
window.addEventListener(
  "unload", function() { GlaxChrome.Digg.StoryDigger.uninit(); }, false);
