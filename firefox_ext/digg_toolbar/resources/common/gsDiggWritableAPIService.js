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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/Util/gsUtilEncryptionService.js");
Cu.import("resource://digg/common/gsDiggCommon.js");
Cu.import("resource://digg/common/gsDiggAPIService.js");
Cu.import("resource://digg/common/gsDiggOAuth.js");
Cu.import("resource://digg/service/gsDiggPreferenceService.js");

// Digg stored preferences.
const PREF_DIGG_ACCESS_TOKEN = "digg_access_token";
const PREF_DIGG_ACCESS_TOKEN_SECRET = "digg_access_token_secret";
const PREF_DIGG_ACCESS_USERNAME = "digg_access_username";

/**
 * The Writable API Service.
 */
GlaxDigg.Digg.WritableAPIService = {
  /* Logger. */
  _logger : null,
  /* Window mediator. */
  _windowMediator : null,

  /* Request token. */
  _requestToken : null,
  /* Request token secret. */
  _requestTokenSecret : null,
  /* Access token. */
  _accessToken : null,
  /* Access token secret. */
  _accessTokenSecret : null,
  /* Username. */
  _accessUsername : null,
  /* The story id in the authorization process. */
  _authorizationStoryId : null,

  /* Constants. */
  get ENCRYPTION_KEY() { return "B1E9B8F102694E31A90F766F0146B4BC"; },
  get CONSUMER_KEY() {
    return "Mu+rUCvTlbqsYYFh6iEwIbNgupisLQorzMtHxgjfr5U1g7/mRtSKgw=="; },
  get CONSUMER_SECRET() {
    return "Nu+rUCs8WrHaOYxVp0NDmKKr9nZzK0EBWi2H8ErGbwcvq+H9DcA="; },
  get OAUTH_SIGNATURE_METHOD() { return "HMAC-SHA1"; },
  get OAUTH_VERSION() { return "1.0"; },
  /* Urls. */
  get DOMAIN_URL() { return "http://services.digg.com/"; },
  get API_URL() { return this.DOMAIN_URL + "1.0/endpoint"; },
  get AUTHORIZE_URL() {
    return "http://digg.com/oauth/authenticate?oauth_token="; },
  get CALLBACK_URL() { return "http://digg.com/oauth/firefox-done"; },
  /* Observer Topics. */
  get TOPIC_DIGG_API_CONNECTED() { return "gs-digg-new-api-connected"; },
  get TOPIC_DIGG_AUTHORIZE_ERROR() { return "gs-digg-api-authorize-error"; },
  get TOPIC_DIGG_REAUTHORIZE() { return "gs-digg-api-reauthorize"; },
  get TOPIC_DIGG_STORY_DONE() { return "gs-digg-api-digg-story-done"; },
  get TOPIC_DIGG_STORY_ALREADY_DUGG() { return "gs-digg-api-digg-story-dugg"; },
  get TOPIC_DIGG_STORY_ERROR() { return "gs-digg-api-digg-story-error"; },

  /**
   * Gets the isConnected state.
   * @return the isConnected state.
   */
  get isConnected() {
    this._logger.trace("get isConnected");

    return (null != this._accessToken && null != this._accessTokenSecret);
  },

  /**
   * Initialize the service.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.WritableAPIService");
    this._logger.trace("init");

    this._windowMediator =
      Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);

    this._getLocalData();
  },

  /**
   * Gets the access token and other data stored in the local database.
   */
  _getLocalData : function() {
    this._logger.trace("_getLocalData");

    let accessToken =
      GlaxDigg.Digg.PreferenceService.getPreference(PREF_DIGG_ACCESS_TOKEN);
    let accessTokenSecret =
      GlaxDigg.Digg.PreferenceService.getPreference(
        PREF_DIGG_ACCESS_TOKEN_SECRET);
    let accessUsername =
      GlaxDigg.Digg.PreferenceService.getPreference(PREF_DIGG_ACCESS_USERNAME);

    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(accessToken)) {
      this._accessToken = accessToken;
    }
    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(accessTokenSecret)) {
      this._accessTokenSecret = accessTokenSecret;
    }
    if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(accessUsername)) {
      this._accessUsername = accessUsername;
    }

    if (this.isConnected) {
      GlaxDigg.ObserverService.notifyObservers(
        null, this.TOPIC_DIGG_API_CONNECTED, null);
    }
  },

  /**
   * Deletes the locally stored data.
   */
  _deleteLocalData : function() {
    this._logger.trace("_deleteLocalData");

    GlaxDigg.Digg.PreferenceService.deletePreference(PREF_DIGG_ACCESS_TOKEN);
    GlaxDigg.Digg.PreferenceService.deletePreference(
      PREF_DIGG_ACCESS_TOKEN_SECRET);
    GlaxDigg.Digg.PreferenceService.deletePreference(PREF_DIGG_ACCESS_USERNAME);

    this._requestToken = null;
    this._requestTokenSecret = null;
    this._accessToken = null;
    this._accessTokenSecret = null;
    this._accessUsername = null;
  },

  /**
   * Gets the decrypted consumer key.
   * @return the decrypted consumer key.
   */
  _getConsumerKey : function() {
    this._logger.trace("_getConsumerKey");

    let consumerKey =
      GlaxDigg.Util.EncryptionService.decryptAES128(
        this.CONSUMER_KEY, this.ENCRYPTION_KEY);

    return consumerKey;
  },

  /**
   * Gets the decrypted consumer secret.
   * @return the decrypted consumer secret.
   */
  _getConsumerSecret : function() {
    this._logger.trace("_getConsumerSecret");

    let consumerSecret =
      GlaxDigg.Util.EncryptionService.decryptAES128(
        this.CONSUMER_SECRET, this.ENCRYPTION_KEY);

    return consumerSecret;
  },

  /**
   * Gets an oauth request token.
   * @param aStoryId the story id.
   */
  getRequestToken : function(aStoryId) {
    this._logger.debug("getRequestToken");

    let that = this;
    let OAuth = GlaxDigg.Digg.OAuth();
    let accessor = { consumerSecret : this._getConsumerSecret() };
    let message = {
      action : this.API_URL,
      method : "POST",
      parameters : [
        ["oauth_consumer_key", this._getConsumerKey()],
        ["oauth_signature_method", this.OAUTH_SIGNATURE_METHOD],
        ["oauth_version", this.OAUTH_VERSION],
        ["oauth_callback", this.CALLBACK_URL],
        ["method", "oauth.getRequestToken"]
      ]
    };
    let parametersMap = null;
    let header = null;

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    parametersMap = OAuth.getParameterMap(message.parameters);
    header = OAuth.getAuthorizationHeader(this.DOMAIN_URL, parametersMap);
    header = { "Authorization" : header };

    this._authorizationStoryId = aStoryId;

    GlaxDigg.Digg.APIService.writeAPI.getRequestToken(
      null,
      function(aRequest) { that._getRequestTokenLoadHandler(aRequest); },
      function(aError) { that._getRequestTokenErrorHandler(aError); },
      header);
  },

  /**
   * Handles a successful response for the get request token call.
   * @param aRequest object.
   */
  _getRequestTokenLoadHandler : function(aRequest) {
    this._logger.trace("_getRequestTokenLoadHandler");

    let responseData = aRequest.responseText.split("&");
    let count = responseData.length;

    for (let i = 0; i < count; i++) {
      if (responseData[i].indexOf("oauth_token=") != -1) {
        this._requestToken = responseData[i].split("=")[1];
      } else if (responseData[i].indexOf("oauth_token_secret=") != -1) {
        this._requestTokenSecret = responseData[i].split("=")[1];
      }
    }

    if (this._requestToken && this._requestTokenSecret) {
      let url = this.AUTHORIZE_URL +  this._requestToken;
      let win = this._windowMediator.getMostRecentWindow("navigator:browser");

      win.gBrowser.selectedTab = win.gBrowser.addTab(url);
    } else {
      this._logger.error(
        "_getRequestTokenLoadHandler:\n" + aRequest.responseText);
      GlaxDigg.ObserverService.notifyObservers(
        null, this.TOPIC_DIGG_AUTHORIZE_ERROR, this._authorizationStoryId);
    }
  },

  /**
   * Handles an error response for the get request token call.
   * @param aRequest the request object.
   */
  _getRequestTokenErrorHandler : function(aRequest) {
    this._logger.error("_getRequestTokenErrorHandler");

    try {
      let errorCode = aRequest.status;
      let errorMessage = aRequest.responseText;

      this._logger.error("_getRequestTokenErrorHandler. " +
        "Error code: " + errorCode + ", message: " + errorMessage);
    } catch (e) {
      // XXX: ignore the error.
    }

    GlaxDigg.ObserverService.notifyObservers(
      null, this.TOPIC_DIGG_AUTHORIZE_ERROR, this._authorizationStoryId);
  },

  /**
   * Handles authorized URL. This is called when the authorized URL is loaded
   * into a tab.
   * @param aURL the url.
   */
  handleAuthorizeURL : function(aURL) {
    this._logger.debug("handleAuthorizeURL");

    if (aURL.indexOf("oauth_token=") != -1) {
      let params =  aURL.split("?")[1].split("&");
      let count = params.length;
      let oauthToken = null;
      let verificationCode = null;

      for (let i = 0; i < count; i++) {
        if (params[i].indexOf("oauth_token=") != -1) {
          oauthToken = params[i].split("=")[1];
        } else if (params[i].indexOf("oauth_verifier=") != -1) {
          verificationCode = params[i].split("=")[1];
        }
      }

      if (oauthToken == this._requestToken && null != verificationCode) {
        this.getAccessToken(verificationCode);
      }
    }
  },

  /**
   * Gets an oauth access token.
   * @param aVerifierCode the verification code.
   */
  getAccessToken : function(aVerifierCode) {
    this._logger.debug("getAccessToken");

    let that = this;
    let OAuth = GlaxDigg.Digg.OAuth();
    let accessor = {
      consumerSecret : this._getConsumerSecret(),
      tokenSecret : this._requestTokenSecret
    };
    let message = {
      action : this.API_URL,
      method : "POST",
      parameters : [
        ["oauth_consumer_key", this._getConsumerKey()],
        ["oauth_token", this._requestToken],
        ["oauth_signature_method", this.OAUTH_SIGNATURE_METHOD],
        ["oauth_version", this.OAUTH_VERSION],
        ["oauth_verifier", aVerifierCode],
        ["method", "oauth.getAccessToken"],
      ]
    };
    let parametersMap = null;
    let header = null;

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    parametersMap = OAuth.getParameterMap(message.parameters);
    header = OAuth.getAuthorizationHeader(this.DOMAIN_URL, parametersMap);
    header = { "Authorization" : header };

    GlaxDigg.Digg.APIService.writeAPI.getAccessToken(
      null,
      function(aRequest) { that._getAccessTokenLoadHandler(aRequest); },
      function(aError) { that._getAccessTokenErrorHandler(aError); },
      header);
  },

  /**
   * Handles a successful response for the get access token call.
   * @param aRequest object.
   */
  _getAccessTokenLoadHandler : function(aRequest) {
    this._logger.trace("_getAccessTokenLoadHandler");

    let responseData = aRequest.responseText.split("&");
    let count = responseData.length;

    // reset the oauth token.
    this._requestToken = null;
    this._requestTokenSecret = null;

    for (let i = 0; i < count; i++) {
      if (responseData[i].indexOf("oauth_token=") != -1) {
        this._accessToken = responseData[i].split("=")[1];
      } else if (responseData[i].indexOf("oauth_token_secret=") != -1) {
        this._accessTokenSecret = responseData[i].split("=")[1];
      } else if (responseData[i].indexOf("user_name=") != -1) {
        this._accessUsername = responseData[i].split("=")[1];
      }
    }

    if (this.isConnected) {
      GlaxDigg.Digg.PreferenceService.setPreference(
        PREF_DIGG_ACCESS_TOKEN, this._accessToken);
      GlaxDigg.Digg.PreferenceService.setPreference(
        PREF_DIGG_ACCESS_TOKEN_SECRET, this._accessTokenSecret);

      if (!GlaxDigg.Util.UtilityService.isNullOrEmpty(this._accessUsername)) {
        GlaxDigg.Digg.PreferenceService.setPreference(
          PREF_DIGG_ACCESS_USERNAME, this._accessUsername);
      }

      GlaxDigg.ObserverService.notifyObservers(
        null, this.TOPIC_DIGG_API_CONNECTED, null);
    } else {
      this._logger.error(
        "_getAccessTokenLoadHandler:\n" + aRequest.responseText);
      GlaxDigg.ObserverService.notifyObservers(
        null, this.TOPIC_DIGG_AUTHORIZE_ERROR, this._authorizationStoryId);
    }
  },

  /**
   * Handles an error response for the get access token call.
   * @param aRequest the request object.
   */
  _getAccessTokenErrorHandler : function(aRequest) {
    this._logger.error("_getAccessTokenErrorHandler");

    try {
      let errorCode = aRequest.status;
      let errorMessage = aRequest.responseText;

      this._logger.error("_getAccessTokenErrorHandler. " +
        "Error code: " + errorCode + ", message: " + errorMessage);
    } catch (e) {
      // XXX: ignore the error.
    }

    GlaxDigg.ObserverService.notifyObservers(
      null, this.TOPIC_DIGG_AUTHORIZE_ERROR, this._authorizationStoryId);
  },

  /**
   * Diggs an story in the API.
   * @param aStoryId the story id.
   */
  diggStory : function(aStoryId) {
    this._logger.debug("diggStory");

    let that = this;
    let OAuth = GlaxDigg.Digg.OAuth();
    let accessor = {
      consumerSecret : this._getConsumerSecret(),
      tokenSecret : this._accessTokenSecret
    };
    let message = {
      action : this.API_URL,
      method : "POST",
      parameters : [
        ["oauth_consumer_key", this._getConsumerKey()],
        ["oauth_token", this._accessToken],
        ["oauth_signature_method", this.OAUTH_SIGNATURE_METHOD],
        ["oauth_version", this.OAUTH_VERSION],
        ["method", "story.digg"],
        ["story_id", aStoryId]
      ]
    };
    let params = { "story_id" : aStoryId };
    let parametersMap = null;
    let header = null;

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    parametersMap = OAuth.getParameterMap(message.parameters);
    header = OAuth.getAuthorizationHeader(this.DOMAIN_URL, parametersMap);
    header = { "Authorization" : header };

    GlaxDigg.Digg.APIService.writeAPI.diggStory(
      params,
      function(aRequest) { that._diggStoryLoadHandler(aRequest, aStoryId); },
      function(aError) { that._diggStoryErrorHandler(aError, aStoryId); },
      header);
  },

  /**
   * Handles a successful response for the digg story call.
   * @param aRequest the response object.
   * @param aStoryId the story id.
   */
  _diggStoryLoadHandler : function(aRequest, aStoryId) {
    this._logger.trace("_diggStoryLoadHandler");

    if (aRequest.status == 200) {  // digg successful.
      GlaxDigg.ObserverService.notifyObservers(
        null, this.TOPIC_DIGG_STORY_DONE, aStoryId);
    } else if (aRequest.status == 401) { // authorization fails.
      this._deleteLocalData();
      GlaxDigg.ObserverService.notifyObservers(
        null, this.TOPIC_DIGG_REAUTHORIZE, aStoryId);
    } else { // handle errors.
      let error = aRequest.responseXML.childNodes[0];

      if ("error" == error.localName && 1059 == error.getAttribute("code")) {
        // story already dugg.
        this._logger.warn("_diggStoryLoadHandler.\n" + aRequest.responseText);
        GlaxDigg.ObserverService.notifyObservers(
          null, this.TOPIC_DIGG_STORY_ALREADY_DUGG, aStoryId);
      } else {
        this._logger.error("_diggStoryLoadHandler.\n" + aRequest.responseText);
        GlaxDigg.ObserverService.notifyObservers(
          null, this.TOPIC_DIGG_STORY_ERROR, aStoryId);
      }
    }
  },

  /**
   * Handles an error response for the digg story call.
   * @param aRequest the request object.
   * @param aStoryId the story id.
   */
  _diggStoryErrorHandler : function(aRequest, aStoryId) {
    this._logger.error("_diggStoryErrorHandler");

    try {
      let errorCode = aRequest.status;
      let errorMessage = aRequest.responseText;

      this._logger.error("_diggStoryErrorHandler. " +
        "Error code: " + errorCode + ", message: " + errorMessage);
    } catch (e) {
      // XXX: ignore the error.
    }

    GlaxDigg.ObserverService.notifyObservers(
      null, this.TOPIC_DIGG_STORY_ERROR, aStoryId);
  }
};

/**
 * Constructor
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.WritableAPIService);
