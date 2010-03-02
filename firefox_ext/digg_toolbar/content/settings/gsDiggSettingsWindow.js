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
Cu.import("resource://digg/service/gsDiggEventNotifier.js");
Cu.import("resource://digg/service/gsDiggContainerService.js");

/**
 * Digg settings window script object.
 */
GlaxChrome.Digg.SettingsWindow = {
  /* Logger for this object. */
  _logger : null,
  /* Window manager. */
  _windowManager : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxChrome.Digg.SettingsWindow");
    this._logger.debug("init");

    this._windowManager =
      Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);

    this._loadTree();
    this.onFriendsActivityChange();
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logger.debug("uninit");

    let win = this._windowManager.getMostRecentWindow("navigator:browser");

    win.setTimeout(function() {
      win.GlaxDigg.Digg.EventNotifier.checkForEvents(true);
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
   * Changes the behavior of the user name controls depending on the "checked"
   * state of the friends' activity checkbox.
   */
  onFriendsActivityChange : function() {
    // XXX: No logging here for efficiency reasons

    let checkbox =
      document.getElementById("gs-digg-settings-friendsActivity-checkbox");
    let textbox =
      document.getElementById("gs-digg-settings-username-textbox");

    if (checkbox.checked) {
      textbox.removeAttribute("disabled");
    } else {
      textbox.setAttribute("disabled", true);
    }
  }
};

window.addEventListener("load",
  function() { GlaxChrome.Digg.SettingsWindow.init(); }, false);
window.addEventListener("unload",
  function() { GlaxChrome.Digg.SettingsWindow.uninit(); }, false);
