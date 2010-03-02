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
 * Toolbar Digg script object.
 */
GlaxChrome.Digg.Toolbar = {
  /* Logger for this object. */
  _logger : null,
  /* String bundle. */
  _stringBundle : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxChrome.Digg.Toolbar");
    this._logger.debug("init");

    this._stringBundle = document.getElementById("gs-digg-string-bundle");

    // collapsed the toolbar by default.
    document.getElementById("gs-digg-toolbar").collapsed = true;
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logger.debug("uninit");
  },

  /**
   * Toggles toolbar visibility.
   */
  toggleToolbar : function() {
    this._logger.debug("toogleToolbar");

    let toolbar = document.getElementById("gs-digg-toolbar");

    toolbar.collapsed = !toolbar.collapsed;
  },

  /**
   * Loads the story info in the toolbar.
   * @param aStory the object that contains the story data.
   */
  loadStory : function(aStory) {
    this._logger.debug("loadStory");

    let titleLabel =
      document.getElementById("gs-digg-toolbar-title-button");
    let commentsButton =
      document.getElementById("gs-digg-toolbar-comments-button");
    let viewsLabel =
      document.getElementById("gs-digg-toolbar-views-button");

    // story title.
    if (null != titleLabel) {
      titleLabel.label = aStory.title;
    }
    // story comments.
    if (null != commentsButton) {
      if (1 == aStory.comments) {
        commentsButton.label =
          this._stringBundle.getString("gs.digg.toolbar.comments.singular");
      } else {
        commentsButton.label =
          this._stringBundle.getFormattedString(
            "gs.digg.toolbar.comments.plural", [aStory.comments]);
      }
    }
    // story views.
    if (null != viewsLabel) {
      if (1 == aStory.views) {
        viewsLabel.label =
          this._stringBundle.getString("gs.digg.toolbar.views.singular");
      } else {
        viewsLabel.label =
          this._stringBundle.getFormattedString(
            "gs.digg.toolbar.views.plural", [aStory.views]);
      }
    }
  },

  /**
   * Fills a related popup with the related story items. Disables menu if empty.
   * @param aPopupKey the popup key to be filled.
   * @param aResults the related stories.
   */
  fillRelatedPopup : function(aPopupKey, aResults) {
    this._logger.debug("fillRelatedPopup");

    let popup =
      document.getElementById("gs-digg-toolbar-related-menupopup-" + aPopupKey);

    while (popup.firstChild) {
      popup.removeChild(popup.firstChild);
    }

    if (aResults) {
      for (let i = 0; i < aResults.length; i++) {
        menuItem = document.createElement("menuitem");
        menuItem.setAttribute("label", aResults[i].title);
        menuItem.setAttribute("value", aResults[i].link);
        menuItem.setAttribute("tooltiptext", aResults[i].link);
        menuItem.setAttribute("oncommand",
          "GlaxChrome.Digg.Toolbar.openRelatedStory(event);");
        popup.appendChild(menuItem);
      }
    }

    if (popup.hasChildNodes()) {
      popup.parentNode.disabled = false;
    } else {
      popup.parentNode.disabled = true;
    }
  },

  /**
   * Opens a related story.
   * @param aEvent the event object.
   */
  openRelatedStory : function(aEvent) {
    this._logger.debug("openRelatedStory");

    let url = aEvent.target.value;

    if (url) {
      GlaxChrome.Digg.Overlay.openURL(url);
    }
  },

  /**
   * Opens the digg site.
   * @param aEvent the event object.
   * @param aElement the button.
   */
  openDiggSite : function(aEvent, aElement) {
    this._logger.debug("openDiggSite");

    if (aEvent.target == aElement) {
      let diggURL = "http://www.digg.com";

      GlaxChrome.Digg.Overlay.openURL(diggURL, GS_DIGG_TRACKING_CODE_HOME);
    }
  },

  /**
   * Opens the feedback page.
   */
  openFeedbackPage : function() {
    this._logger.debug("openFeedbackPage");

    let feedback = "http://digg.com/contact?ref=fftoolbar&contact-type=2";

    GlaxChrome.Digg.Overlay.openURL(feedback, GS_DIGG_TRACKING_CODE_FEEDBACK);
  },

  /**
   * Opens a random story.
   * @param aEvent the event object.
   */
  openRandomStory : function(aEvent) {
    this._logger.debug("openRandomStory");

    let randomURL = "http://digg.com/random";
    let callback = function(aResult) {
      if (null != aResult) {
        randomURL = aResult.link;
      }

      window.openUILink(randomURL, aEvent);
    }

    GlaxDigg.Digg.StoryService.getRandomShortURL(callback);
  },

  /**
   * Shares the story with facebook.
   */
  shareWithFacebook : function() {
    this._logger.debug("shareWithFacebook");

    let url = gBrowser.selectedTab.linkedBrowser.currentURI.spec;
    let title = gBrowser.selectedTab.linkedBrowser.contentTitle;
    let callback = function(aShortURL, aTitle) {
      if (null == aShortURL) {
        aShortURL = "http://digg.com/" + url;
      }
      if (null == aTitle) {
        aTitle = title;
      }
      let shareURL =
        "http://www.facebook.com/sharer.php?" +
        "u=" + encodeURIComponent(aShortURL + "?f") +
        "&t=" + encodeURIComponent(aTitle);

      window.open(shareURL, "_blank",
        "toolbar=0,status=0,width=626,height=436");
    };

    GlaxChrome.Digg.StorySession.getStoryShortURL(url, callback);
  },

  /**
   * Shares the story with twitter.
   */
  shareWithTwitter : function() {
    this._logger.debug("shareWithTwitter");

    let url = gBrowser.selectedTab.linkedBrowser.currentURI.spec;
    let title = gBrowser.selectedTab.linkedBrowser.contentTitle;
    let callback = function(aShortURL, aTitle) {
      if (null == aShortURL) {
        aShortURL = "http://digg.com/" + url;
      }
      if (null == aTitle) {
        aTitle = title;
      }
      let shareURL =
        "http://twitter.com/home?status=" +
        escape(aTitle + ": "+ aShortURL + "?t");

      window.open(shareURL, "_blank",
        "toolbar=0,status=0,width=778,height=536");
    };

    GlaxChrome.Digg.StorySession.getStoryShortURL(url, callback);
  },

  /**
   * Shares the story with email.
   */
  shareWithEmail : function() {
    this._logger.debug("shareWithEmail");

    let externalProtocolService =
      Cc["@mozilla.org/uriloader/external-protocol-service;1"].
        getService(Ci.nsIExternalProtocolService);
    let uri = Cc["@mozilla.org/network/simple-uri;1"].getService(Ci.nsIURI);
    let url = gBrowser.selectedTab.linkedBrowser.currentURI.spec;
    let title = gBrowser.selectedTab.linkedBrowser.contentTitle;
    let callback = function(aShortURL, aTitle) {
      if (null == aShortURL) {
        aShortURL = "http://digg.com/" + url;
      }
      if (null == aTitle) {
        aTitle = title;
      }

      uri.spec =
        "mailto:?subject=" + aTitle +" &body=" + escape(aShortURL + "?e");
      externalProtocolService.loadUrl(uri);
    };

    GlaxChrome.Digg.StorySession.getStoryShortURL(url, callback);
  }
};

window.addEventListener(
  "load", function() { GlaxChrome.Digg.Toolbar.init(); }, false);
window.addEventListener(
  "unload", function() { GlaxChrome.Digg.Toolbar.uninit(); }, false);
