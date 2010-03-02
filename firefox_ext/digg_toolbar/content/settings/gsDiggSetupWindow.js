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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://digg/common/gsDiggCommon.js");
Cu.import("resource://digg/service/gsDiggContainerService.js");

// Preference keys.
const GS_DIGG_PREF_USER_NAME = GlaxDigg.Digg.PREF_BRANCH + "username";
const GS_DIGG_PREF_NOTIFY_NEWS = GlaxDigg.Digg.PREF_BRANCH + "notify.news";
const GS_DIGG_PREF_NOTIFY_VIDEOS = GlaxDigg.Digg.PREF_BRANCH + "notify.videos";
const GS_DIGG_PREF_NOTIFY_IMAGES = GlaxDigg.Digg.PREF_BRANCH + "notify.images";
const GS_DIGG_PREF_NOTIFY_TOPIC =
  GlaxDigg.Digg.PREF_BRANCH + "notify.topic.list";
const GS_DIGG_PREF_NOTIFY_CONTAINER =
  GlaxDigg.Digg.PREF_BRANCH + "notify.container.list";
const GS_DIGG_PREF_NOTIFY_FRIENDS =
  GlaxDigg.Digg.PREF_BRANCH + "notify.friendsActivity";
// Setup wizard observer.
const GS_DIGG_SETUP_TOPIC = "gs-digg-setup-wizard-ended";

/**
 * Digg setup window script object.
 */
GlaxChrome.Digg.SetupWindow = {
  /* Logger for this object. */
  _logger : null,
  /* String bundle. */
  _stringBundle : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxChrome.Digg.SetupWindow");
    this._logger.debug("init");

    this._stringBundle = document.getElementById("gs-digg-setup-string-bundle");

    this._loadTree();

    // Focus the user name textbox when the window loads
    window.setTimeout(function() {
      document.getElementById("gs-digg-wizard-user-name").focus();
    }, 0);
  },

  /**
   * Initializes the tree of topics.
   */
  _initTree : function() {
    this._logger.trace("_initTree");

    let tree = document.getElementById("gs-digg-settings-topics-tree");
    let containerList =
      document.getElementById("gs-digg-settings-notify-container-list");
    let topicList =
      document.getElementById("gs-digg-settings-notify-topic-list");

    tree.loadSelectedValues(containerList.value, topicList.value);
  },

  /**
   * Calls the api to load the tree with the containers and topics list.
   */
  _loadTree : function() {
    this._logger.trace("_loadTree");

    let that = this;
    let tree = document.getElementById("gs-digg-settings-topics-tree");
    let callback = function(aResults) {
      that._loadTreeLoadHandler(aResults);
    };

    tree.setBusy(true);

    try {
      GlaxDigg.Digg.ContainerService.listContainers(callback);
    } catch(e) {
      this._logger.error("_loadTree:\n" + e);
    }
  },

  /**
   * Handles the response from the listContainers method. Loads the tree with
   * containers and topics.
   * @param aResults The array of objects in the response.
   */
  _loadTreeLoadHandler : function(aResults) {
    this._logger.trace("_loadTreeLoadHandler");

    let tree = document.getElementById("gs-digg-settings-topics-tree");

    if (aResults && 0 < aResults.length) {
      let containerDTO = null;

      for (let i = 0; i < aResults.length; i++) {
        containerDTO = aResults[i];
        tree.addContainer(containerDTO);
      }

      this._initTree();
    }

    tree.setBusy(false);
  },

  /**
   * Selects the username option when the textbox receives the focus.
   */
  selectUsernameOption : function() {
    this._logger.debug("selectUsernameOption");

    document.getElementById("gs-digg-wizard-radiogroup").value = "1";
  },

  /**
   * Selects the user radio option and cleans the textbox depending on the
   * selected option.
   */
  selectRadioOption : function() {
    this._logger.debug("selectRadioOption");

    let radioGroup = document.getElementById("gs-digg-wizard-radiogroup");
    let userName = document.getElementById("gs-digg-wizard-user-name");

    switch (radioGroup.value) {
      case "1":
        userName.removeAttribute("disabled");
        break;
      case "2":
        userName.setAttribute("disabled", true);
        break;
    }
  },

  /**
   * Performs the user selected option in the radiogroup.
   */
  performUserAction : function() {
    this._logger.debug("performUserAction");

    let radioGroup = document.getElementById("gs-digg-wizard-radiogroup");
    let userName = document.getElementById("gs-digg-wizard-user-name");

    switch (radioGroup.value) {
      case "1":
        GlaxDigg.Application.prefs.setValue(
          GS_DIGG_PREF_USER_NAME, userName.value);
        GlaxDigg.Application.prefs.setValue(GS_DIGG_PREF_NOTIFY_FRIENDS, true);
        break;
      case "2":
        GlaxDigg.Application.prefs.setValue(GS_DIGG_PREF_USER_NAME, "");
        GlaxDigg.Application.prefs.setValue(GS_DIGG_PREF_NOTIFY_FRIENDS, false);
        break;
    }
  },

  /**
   * Saves the user selected settings.
   */
  saveSettings : function() {
    this._logger.debug("saveSettings");

    let tree = document.getElementById("gs-digg-settings-topics-tree");
    let newsCheckbox =
      document.getElementById("gs-digg-settings-notify-news-checkbox");
    let videosCheckbox =
      document.getElementById("gs-digg-settings-notify-videos-checkbox");
    let imagesCheckbbox =
      document.getElementById("gs-digg-settings-notify-images-checkbox");

    GlaxDigg.Application.prefs.setValue(
      GS_DIGG_PREF_NOTIFY_NEWS, newsCheckbox.checked);
    GlaxDigg.Application.prefs.setValue(
      GS_DIGG_PREF_NOTIFY_VIDEOS, videosCheckbox.checked);
    GlaxDigg.Application.prefs.setValue(
      GS_DIGG_PREF_NOTIFY_IMAGES, imagesCheckbbox.checked);
    GlaxDigg.Application.prefs.setValue(
      GS_DIGG_PREF_NOTIFY_CONTAINER, tree.getSelectedContainerList());
    GlaxDigg.Application.prefs.setValue(
      GS_DIGG_PREF_NOTIFY_TOPIC, tree.getSelectedTopicList());

    GlaxDigg.ObserverService.notifyObservers(null, GS_DIGG_SETUP_TOPIC, true);
  },

  /**
   * Asks the user for confirmation to cancel the wizard.
   * @param aEvent The cancel event.
   */
  onCancel : function(aEvent) {
    this._logger.debug("onCancel");

    let prompts =
      Cc["@mozilla.org/embedcomp/prompt-service;1"].
        getService(Ci.nsIPromptService);
    let result =
      prompts.confirm(window,
        this._stringBundle.getString("gs.digg.setup.cancel.title"),
        this._stringBundle.getString("gs.digg.setup.cancel.message"));

    if (!result) {
      aEvent.cancel();
    } else {
      GlaxDigg.ObserverService.notifyObservers(null, GS_DIGG_SETUP_TOPIC, true);
    }
  }
};

window.addEventListener(
  "load", function() { GlaxChrome.Digg.SetupWindow.init(); }, false);
