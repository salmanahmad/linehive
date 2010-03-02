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
Cu.import("resource://digg/common/gsDiggWritableAPIService.js");
Cu.import("resource://digg/common/gsDiggStartupService.js");
Cu.import("resource://digg/common/gsDiggUninstallService.js");
Cu.import("resource://digg/service/gsDiggStoryService.js");

// Preference keys.
const GS_DIGG_PREF_BUTTONS_PLACE = GlaxDigg.Digg.PREF_BRANCH + "buttons.place";
const GS_DIGG_PREF_OPEN_LINKS = GlaxDigg.Digg.PREF_BRANCH + "open.links";
const GS_DIGG_PREF_SNOOZE = GlaxDigg.Digg.PREF_BRANCH + "snooze";
const GS_DIGG_PREF_USER_NAME = GlaxDigg.Digg.PREF_BRANCH + "username";
const GS_DIGG_PREF_NOTIFY_NEWS = GlaxDigg.Digg.PREF_BRANCH + "notify.news";
const GS_DIGG_PREF_NOTIFY_VIDEOS = GlaxDigg.Digg.PREF_BRANCH + "notify.videos";
const GS_DIGG_PREF_NOTIFY_IMAGES = GlaxDigg.Digg.PREF_BRANCH + "notify.images";
const GS_DIGG_PREF_BUTTONS_INSTALLED =
  GlaxDigg.Digg.PREF_BRANCH + "buttons.adjusted";
const GS_DIGG_PREF_NOTIFY_DIGGS =
  GlaxDigg.Digg.PREF_BRANCH + "notify.diggCount";
const GS_DIGG_PREF_NOTIFY_TOPIC =
  GlaxDigg.Digg.PREF_BRANCH + "notify.topic.list";
const GS_DIGG_PREF_NOTIFY_FRIENDS =
  GlaxDigg.Digg.PREF_BRANCH + "notify.friendsActivity";
const GS_DIGG_PREF_NOTIFY_CONTAINER =
  GlaxDigg.Digg.PREF_BRANCH + "notify.container.list";
const GS_DIGG_PREF_NOTIFICATION_TYPE =
  GlaxDigg.Digg.PREF_BRANCH + "notification.type";
const GS_DIGG_PREF_NOTIFICATION_STYLE =
  GlaxDigg.Digg.PREF_BRANCH + "notification.style";
const GS_DIGG_PREF_NOTIFICATION_AUTOHIDE =
  GlaxDigg.Digg.PREF_BRANCH + "notification.autohide";

// Digg tracking codes.
const GS_DIGG_TRACKING_CODE_HOME                       = "OTC-ff2-1";
const GS_DIGG_TRACKING_CODE_FEEDBACK                   = "OTC-ff2-2";
const GS_DIGG_TRACKING_CODE_TOOLBAR_DIGGS              = "OTC-ff2-3";
const GS_DIGG_TRACKING_CODE_TOOLBAR_DUGG               = "OTC-ff2-4";
const GS_DIGG_TRACKING_CODE_TOOLBAR_SUBMIT             = "OTC-ff2-5";
const GS_DIGG_TRACKING_CODE_TOOLBAR_COMMENTS           = "OTC-ff2-6#comments";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_DIGGS         = "OTC-ff2-7";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_DUGG          = "OTC-ff2-8";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_TITLE         = "OTC-ff2-9";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_COMMENT       = "OTC-ff2-10";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_TOPIC         = "OTC-ff2-11";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_COMMENTS      = "OTC-ff2-12";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_SUBMITTER     = "OTC-ff2-13";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_DIGGER        = "OTC-ff2-14";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_COMMENTER     = "OTC-ff2-15";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_ADMIN_MESSAGE = "OTC-ff2-16";
const GS_DIGG_TRACKING_CODE_TOOLBAR_TITLE              = "OTC-ff2-17";
const GS_DIGG_TRACKING_CODE_TOOLBAR_VIEWS              = "OTC-ff2-18";
const GS_DIGG_TRACKING_CODE_URLBAR_DIGGS               = "OTC-ff2-19";
const GS_DIGG_TRACKING_CODE_URLBAR_DUGG                = "OTC-ff2-20";
const GS_DIGG_TRACKING_CODE_URLBAR_SUBMIT              = "OTC-ff2-21";

// Content type regular expressions.
const GS_DIGG_MEDIA_IMAGE_REGEX = /image\//gi;
const GS_DIGG_MEDIA_VIDEO_REGEX =
  /(video\/)|(application\/x-shockwave-flash)/gi;
// Location regular expressions to determine media type.
const GS_DIGG_MEDIA_IMAGE_SITE_REGEX =
  /apod\.nasa\.gov|photobucket\.com|imageshack\.us|tinypic\.com|flickr\.com/gi
const GS_DIGG_MEDIA_VIDEO_SITE_REGEX =
  /youtube\.com|break\.com|funnyordie\.com|5min\.com|breitbart\.tv|metacafe\.com|video\.google\.com|current\.com/gi;

// The place where the main buttons are located.
const GS_DIGG_BUTTONS_ON_TOOLBAR = 0;
const GS_DIGG_BUTTONS_ON_URLBAR = 0;
// Setup wizard observer.
const GS_DIGG_SETUP_TOPIC = "gs-digg-setup-wizard-ended";

/**
 * Main Digg script object.
 */
GlaxChrome.Digg.Overlay = {
  /* Logger for this object. */
  _logger : null,
  /* Preference service */
  _preferenceService : null,
  /* String bundle. */
  _stringBundle : null,

  /* Reference to the settings window. */
  _settingsWindow : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxChrome.Digg.Overlay");
    this._logger.debug("init");

    let that = this;

    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    this._stringBundle = document.getElementById("gs-digg-string-bundle");

    GlaxDigg.ObserverService.addObserver(this, GS_DIGG_SETUP_TOPIC, false);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.addObserver(GS_DIGG_PREF_SNOOZE, this, false);
    this._preferenceService.addObserver(
      GS_DIGG_PREF_BUTTONS_PLACE, this, false);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);

    this._installToolbarButton();
    this._addContextMenuListeners();
    this._updateSnoozeBroadcaster();
    this._updateButtonsLocation();

    window.setTimeout(function() { that._showFirstRun() }, 0);
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logger.debug("uninit");

    GlaxDigg.ObserverService.removeObserver(this, GS_DIGG_SETUP_TOPIC);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.removeObserver(GS_DIGG_PREF_SNOOZE, this);
    this._preferenceService.removeObserver(GS_DIGG_PREF_BUTTONS_PLACE, this);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);
  },

  /**
   * Installs the buttons in the toolbar's current set during the first run.
   */
  _installToolbarButton : function() {
    this._logger.trace("_installToolbarButton");

    let buttonsAdded =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_BUTTONS_INSTALLED).value;

    if (!buttonsAdded) {
      let mainToolbar = document.getElementById("nav-bar");
      let diggToolbar = document.getElementById("gs-digg-toolbar");
      let mainToolbarSet = mainToolbar.currentSet;
      let diggToolbarSet =
        "gs-digg-toolbar-logo-button,separator,gs-digg-toolbar-title-button," +
        "gs-digg-toolbar-comments-button,gs-digg-toolbar-views-button," +
        "spring,gs-digg-toolbar-related-button,separator," +
        "gs-digg-toolbar-twitter-button,gs-digg-toolbar-facebook-button," +
        "gs-digg-toolbar-mail-button,gs-digg-toolbar-random-button";
      let newMainToolbarButtons =
        "gs-digg-toolbar-toggle-button,gs-digg-toolbar-diggs-comboitem," +
        "gs-digg-toolbar-submit-button";
      let newMainToolbarSet;

      if (-1 != mainToolbarSet.indexOf("urlbar-container")) {
         newMainToolbarSet = mainToolbarSet.replace(
           /urlbar-container/, newMainToolbarButtons + ",urlbar-container");
      } else {
         newMainToolbarSet = mainToolbarSet + "," + newMainToolbarButtons;
      }

      mainToolbar.setAttribute("currentset", newMainToolbarSet);
      mainToolbar.currentSet = newMainToolbarSet;
      document.persist("nav-bar", "currentset");

      diggToolbar.setAttribute("currentset", diggToolbarSet);
      diggToolbar.currentSet = diggToolbarSet;
      document.persist("gs-digg-toolbar", "currentset");

      GlaxDigg.Application.prefs.setValue(GS_DIGG_PREF_BUTTONS_INSTALLED, true);

      try {
        BrowserToolboxCustomizeDone(true);
      } catch (e) {
        // XXX: Ignore the error, just try to call the firefox method.
      }
    }
  },

  /**
   * Adds the context menu listeners.
   */
  _addContextMenuListeners : function() {
    this._logger.trace("_addContextMenuListeners");

    let that = this;
    let contextMenu = document.getElementById("contentAreaContextMenu");

    contextMenu.addEventListener("popupshowing",
      function(aEvent) { that._toggleContextMenu(aEvent); }, false);
  },

  /**
   * Toggles the context menu if it's over a link or a page.
   * @param aEvent the event object.
   */
  _toggleContextMenu : function(aEvent) {
    this._logger.trace("_toggleContextMenu");

    let menuItem =
      document.getElementById("gs-digg-context-shorturl-menuitem");
    let menuSeparator =
      document.getElementById("gs-digg-context-shorturl-menuseparator");
    let menuItemLink =
      document.getElementById("gs-digg-context-shorturl-menuitem-link");
    let menuSeparatorLink =
      document.getElementById("gs-digg-context-shorturl-menuseparator-link");

    menuItem.hidden = menuSeparator.hidden = gContextMenu.onLink;
    menuItemLink.hidden = menuSeparatorLink.hidden = !gContextMenu.onLink;
  },

  /**
   * Shows the setup wizard if its the first time the extension is run.
   */
  _showFirstRun : function() {
    this._logger.debug("_showFirstRun");

    if (GlaxDigg.Digg.StartupService.isFirstRun &&
        !GlaxDigg.Digg.StartupService.setupWizardShown) {
      window.openUILinkIn(
        "chrome://digg/content/settings/gsDiggSetupWindow.xul", "tab");

      GlaxDigg.Digg.StartupService.setSetupWizardShown();
    }
  },

  /**
   * Opens the landing page.
   */
  _openLandingPage : function() {
    this._logger.trace("_openLandingPage");

    let landingPageURL = "http://about.digg.com/firefox/success";

    window.openUILinkIn(landingPageURL, "tab");

    GlaxDigg.Digg.EventNotifier.initialize();
  },

  /**
   * Loads the story info in the toolbar.
   * @param aStory the object that contains the story data.
   */
  loadStory : function(aStory) {
    this._logger.debug("loadStory");

    let diggsButton = document.getElementById("gs-digg-toolbar-diggs-button");
    let diggItButton = document.getElementById("gs-digg-toolbar-diggit-button");
    let diggsUrlbar = document.getElementById("gs-digg-urlbar-diggs-button");
    let diggItUrlbar = document.getElementById("gs-digg-urlbar-diggit-button");

    // story diggs.
    if (null != diggsButton || null != diggsUrlbar) {
      let diggsLabel = null;

      if (1 == aStory.diggs) {
        diggsLabel =
          this._stringBundle.getString("gs.digg.toolbar.diggs.singular");
      } else {
        diggsLabel =
          this._stringBundle.getFormattedString(
            "gs.digg.toolbar.diggs.plural", [aStory.diggs]);
      }

      if (null != diggsButton) {
        diggsButton.label = diggsLabel;
      }
      if (null != diggsUrlbar) {
        diggsUrlbar.value = diggsLabel;
      }
    }

    // digg it button.
    if (null != diggItButton || null != diggItUrlbar) {
      let storyDugg =
        GlaxChrome.Digg.StoryDigger.checkIfStoryHasBeenDugg(aStory.storyId);

      if (null != diggItButton) {
        diggItButton.removeAttribute("disabled");

        if (storyDugg) {
          diggItButton.setAttribute("dugg", "true");
        } else {
          diggItButton.removeAttribute("dugg");
        }
      }

      if (null != diggItUrlbar) {
        diggItUrlbar.removeAttribute("disabled");

        if (storyDugg) {
          diggItUrlbar.setAttribute("dugg", "true");
        } else {
          diggItUrlbar.removeAttribute("dugg");
        }
      }
    }
  },

  /**
   * Opens the given URL in the same tab, in a new tab, or in a new window,
   * depending on the Digg preference.
   * @param aURL The URL to be opened.
   * @param aTrackingCode The Digg tracking code to be appended to the URL.
   */
  openURL : function(aURL, aTrackingCode) {
    this._logger.debug("openURL");

    let openLinks =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_OPEN_LINKS).value;

    if (aTrackingCode) {
      aURL += (aURL.match(/\?/g) ? "&" : "?") + aTrackingCode;
    }

    switch (openLinks) {
      case 1:  window.openUILinkIn(aURL, "tab");     break;
      case 2:  window.openUILinkIn(aURL, "window");  break;
      default: window.openUILinkIn(aURL, "current"); break;
    }
  },

  /**
   * Diggs a story from the toolbar button or the urlbar button.
   * @param aButton the event button.
   */
  diggStoryFromToolbar : function(aButton) {
    this._logger.debug("diggStoryFromToolbar");

    if (!aButton.hasAttribute("disabled")) {
      if (aButton.hasAttribute("dugg")) {
        if ("gs-digg-toolbar-diggit-button" == aButton.getAttribute("id")) {
          GlaxChrome.Digg.StorySession.openStory(
            GS_DIGG_TRACKING_CODE_TOOLBAR_DUGG);
        } else {
          GlaxChrome.Digg.StorySession.openStory(
            GS_DIGG_TRACKING_CODE_URLBAR_DUGG);
        }
      } else {
        let that = this;
        let processStory = GlaxChrome.Digg.StorySession.currentStory;
        let processURL = gBrowser.selectedTab.linkedBrowser.currentURI.spec;

        if (null != processStory) {
          let tabId = gBrowser.selectedTab.linkedPanel;
          let callback = function(aSuccess, aIncreaseDigg) {
            if (aSuccess) {
              if (aIncreaseDigg) {
                processStory.diggs++;
                GlaxChrome.Digg.StorySession.updateCacheStory(
                  processURL, processStory);
              }
              if (tabId == gBrowser.selectedTab.linkedPanel) {
                GlaxChrome.Digg.StorySession.loadStoryFromCache(processURL);
              }
            }

            aButton.removeAttribute("disabled");
          };

          aButton.setAttribute("disabled", true);
          GlaxChrome.Digg.StoryDigger.diggStory(processStory.storyId, callback);
        }
      }
    }
  },

  /**
   * Submits the current url as a Digg story.
   * @param aTrackingCode the Digg tracking code to be appended to the URL.
   */
  submitStory : function(aTrackingCode) {
    this._logger.debug("submitStory");

    let url = gBrowser.selectedTab.linkedBrowser.currentURI.spec;
    let title = gBrowser.selectedTab.linkedBrowser.contentTitle;
    let shortUrl = GlaxChrome.Digg.StorySession.getShortURLFromURL(url);

    if (null != shortUrl) {
      let that = this;
      let callback = function(aLinkURL) {
        if (null != aLinkURL) {
          url = aLinkURL;
          title = "";
        }

        that._submitStory(url, title, aTrackingCode);
      }

      GlaxDigg.Digg.StoryService.getLinkFromShortURL(shortUrl, callback);
    } else {
      this._submitStory(url, title, aTrackingCode);
    }
  },

  /**
   * Submits the current url as a Digg story.
   * @param aURL the submit url.
   * @param aTitle the submit title.
   * @param aTrackingCode the Digg tracking code to be appended to the URL.
   */
  _submitStory : function(aURL, aTitle, aTrackingCode) {
    this._logger.trace("_submitStory");

    let doc = gBrowser.selectedTab.linkedBrowser.contentDocument;
    let description = this._getMetaDescriptionFromDocument(doc);
    let media = this._getMetaMediaFromDocument(doc);
    let submitURL = null;

    if (GlaxDigg.Util.UtilityService.isNullOrEmpty(media)) {
      media = this._getDocumentMediaType(doc, aURL);
    }

    submitURL = "http://digg.com/submit?phase=2&url=" + aURL +
      "&title=" + aTitle + "&bodytext=" + description + "&media=" + media;

    this.openURL(submitURL, aTrackingCode);
  },

  /**
   * Obtains the Digg media value for the current document.
   * @param aDocument the document.
   * @param aURL the url.
   * @return The Digg media (news, video or image).
   */
  _getDocumentMediaType : function(aDocument, aURL) {
    this._logger.trace("_getDocumentMediaType");

    let media = "";
    let contentType = String(aDocument.contentType);

    if (contentType.match(GS_DIGG_MEDIA_IMAGE_REGEX)) {
      media = "image";
    } else if (contentType.match(GS_DIGG_MEDIA_VIDEO_REGEX)) {
      media = "video";
    } else if (aURL.match(GS_DIGG_MEDIA_IMAGE_SITE_REGEX)) {
      media = "image";
    } else if (aURL.match(GS_DIGG_MEDIA_VIDEO_SITE_REGEX)) {
      media = "video";
    }

    return media;
  },

  /**
   * Gets the meta tags description content from a document.
   * @param aDoc the the document.
   * @return the string with the meta tag description.
   */
  _getMetaDescriptionFromDocument : function(aDoc) {
    this._logger.trace("_getMetaDescriptionFromDocument");

    let description = "";
    let xPathExpression =
      "//meta[@name='description' or @name='Description' or " +
      "@name='DESCRIPTION']";
    let metaTags =
      GlaxDigg.Util.UtilityService.evaluateXPath(aDoc, xPathExpression);

    if (metaTags.length > 0) {
      description = metaTags[0].content;
    }

    return description;
  },

  /**
   * Gets the meta tags description content from a document.
   * @param aDoc the the document.
   * @return the string with the meta tag media.
   */
  _getMetaMediaFromDocument : function(aDoc) {
    this._logger.trace("_getMetaMediaFromDocument");

    let media = "";
    let xPathExpression =
      "//meta[@name='medium' or @name='Medium' or @name='MEDIUM']";
    let metaTags =
      GlaxDigg.Util.UtilityService.evaluateXPath(aDoc, xPathExpression);

    if (metaTags.length > 0) {
      media = metaTags[0].content;
    }

    return media;
  },

  /**
   * Opens the settings window.
   */
  openSettingsWindow : function() {
    this._logger.debug("openSettingsWindow");

    if (null == this._settingsWindow || this._settingsWindow.closed) {
      this._settingsWindow =
        window.openDialog(
          "chrome://digg/content/settings/gsDiggSettingsWindow.xul", "",
          "chrome,centerscreen,dialog,resizable=no");
    }

    this._settingsWindow.focus();
  },

  /**
   * Copies the short url in the clipboard.
   */
  copyShortURL : function() {
    this._logger.debug("copyShortURL");

    let clipboard =
      Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);
    let string =
      Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
    let transferable =
      Cc["@mozilla.org/widget/transferable;1"].
        createInstance(Ci.nsITransferable);
    let url = gBrowser.selectedTab.linkedBrowser.currentURI.spec;
    let callback = function(aShortUrl, aTitle) {
      if (null == aShortUrl) {
        aShortURL = "http://digg.com/" + url;
      }

      string.data = aShortUrl;
      transferable.addDataFlavor("text/unicode");
      transferable.setTransferData(
        "text/unicode", string, aShortUrl.length * 2);
      clipboard.setData(transferable, null, Ci.nsIClipboard.kGlobalClipboard);
    };

    GlaxChrome.Digg.StorySession.getStoryShortURL(url, callback);
  },

  /**
   * Toggles the snooze setting.
   */
  toggleSnooze : function() {
    this._logger.debug("toggleSnooze");

    let snooze = GlaxDigg.Application.prefs.get(GS_DIGG_PREF_SNOOZE).value;

    GlaxDigg.Application.prefs.setValue(GS_DIGG_PREF_SNOOZE, !snooze);
  },

  /**
   * Updates the checked state of the snooze broadcaster according to the
   * current preference value.
   */
  _updateSnoozeBroadcaster : function() {
    this._logger.trace("_updateSnoozeBroadcaster");

    let snoozeBroadcaster =
      document.getElementById("gs-digg-broadcaster-snooze");
    let snoozeActive =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_SNOOZE).value;

    snoozeBroadcaster.setAttribute("checked", snoozeActive);
    snoozeBroadcaster.setAttribute("tooltiptext",
      (snoozeActive ?
        this._stringBundle.getString("gs.digg.snooze.deactivate") :
        this._stringBundle.getString("gs.digg.snooze.activate")));
  },

  /**
   * Updates the main buttons location: the toolbar or the urlbar.
   */
  _updateButtonsLocation : function() {
    this._logger.trace("_updateButtonsLocation");

    let diggsItem = document.getElementById("gs-digg-toolbar-diggs-comboitem");
    let submitItem = document.getElementById("gs-digg-toolbar-submit-button");
    let diggsIcon = document.getElementById("gs-digg-urlbar-diggs-button");
    let diggItIcon = document.getElementById("gs-digg-urlbar-diggit-button");
    let submitIcon = document.getElementById("gs-digg-urlbar-submit-button");
    let buttonsPlace =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_BUTTONS_PLACE).value;

    if (null == diggsItem) {
      this._restoreToolbarButton("gs-digg-toolbar-diggs-comboitem");
      diggsItem = document.getElementById("gs-digg-toolbar-diggs-comboitem");
    }
    if (null == submitItem) {
      this._restoreToolbarButton("gs-digg-toolbar-submit-button");
      submitItem = document.getElementById("gs-digg-toolbar-submit-button");
    }

    if (GS_DIGG_BUTTONS_ON_TOOLBAR == buttonsPlace) {
      if (null != diggsItem) {
        diggsItem.removeAttribute("hidden");
      }
      if (null != submitItem) {
        submitItem.removeAttribute("hidden");
      }
      if (null != diggsIcon) {
        diggsIcon.setAttribute("hidden", true);
      }
      if (null != diggItIcon) {
        diggItIcon.setAttribute("hidden", true);
      }
      if (null != submitIcon) {
        submitIcon.setAttribute("hidden", true);
      }
    } else {
      if (null != diggsItem) {
        diggsItem.setAttribute("hidden", true);
      }
      if (null != submitItem) {
        submitItem.setAttribute("hidden", true);
      }
      if (null != diggsIcon) {
        diggsIcon.removeAttribute("hidden");
      }
      if (null != diggItIcon) {
        diggItIcon.removeAttribute("hidden");
      }
      if (null != submitIcon) {
        submitIcon.removeAttribute("hidden");
      }
    }
  },

  /**
   * Restores a toolbar button in the main toolbar.
   * @param aButtonId the button id.
   */
  _restoreToolbarButton : function(aButtonId) {
    this._logger.trace("_restoreToolbarButton");

    let button = document.getElementById(aButtonId);

    if (null == button) {
      let mainToolbar = document.getElementById("nav-bar");
      let mainToolbarSet = mainToolbar.currentSet;
      let newMainToolbarSet;

      if (-1 != mainToolbarSet.indexOf("urlbar-container")) {
         newMainToolbarSet = mainToolbarSet.replace(
           /urlbar-container/, aButtonId + ",urlbar-container");
      } else {
         newMainToolbarSet = mainToolbarSet + "," + aButtonId;
      }

      mainToolbar.setAttribute("currentset", newMainToolbarSet);
      mainToolbar.currentSet = newMainToolbarSet;
      document.persist("nav-bar", "currentset");

      try {
        BrowserToolboxCustomizeDone(true);
      } catch (e) {
        // XXX: Ignore the error, just try to call the firefox method.
      }
    }
  },

  /**
   * Observes changes in Digg preferences.
   * @param aSubject The object that experienced the change.
   * @param aTopic The topic being observed.
   * @param aData The data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logger.debug("observe");

    let that = this;

    switch (aTopic) {
      case GS_DIGG_SETUP_TOPIC:
        window.setTimeout(function() { that._openLandingPage(); }, 100);
        break;
      case "nsPref:changed":
        switch (aData) {
          case GS_DIGG_PREF_SNOOZE:
            this._updateSnoozeBroadcaster();
            break;
          case GS_DIGG_PREF_BUTTONS_PLACE:
            this._updateButtonsLocation();
            break;
        }
        break;
    }
  }
};

window.addEventListener(
  "load", function() { GlaxChrome.Digg.Overlay.init(); }, false);
window.addEventListener(
  "unload", function() { GlaxChrome.Digg.Overlay.uninit(); }, false);
