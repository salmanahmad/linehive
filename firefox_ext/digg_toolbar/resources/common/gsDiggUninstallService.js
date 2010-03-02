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
Cu.import("resource://digg/common/gsDiggCommon.js");
Cu.import("resource://digg/common/gsDiggDBService.js");

// The extension manager action requested observer topic
const TOPIC_EM_ACTION_REQUESTED = "em-action-requested";
// The quit application observer topic
const TOPIC_QUIT_APPLICATION = "quit-application";

/**
 * The Uninstall Service.
 */
GlaxDigg.Digg.UninstallService = {
  /* Logger for this object. */
  _logger : null,

  /* Flag indicates whether the uninstall should be executed on exit. */
  _shouldUninstall : false,

  /**
   * Initializes the resource.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.UninstallService");
    this._logger.trace("_init");

    GlaxDigg.ObserverService.addObserver(this, TOPIC_QUIT_APPLICATION, false);
    GlaxDigg.ObserverService.addObserver(
      this, TOPIC_EM_ACTION_REQUESTED, false);
  },

  /**
   * Cleans up code to remove the extension directory and related preferences.
   */
  _cleanUp : function() {
    this._logger.trace("_cleanUp");

    let prefBranch =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    let installFolder;

    // remove preferences.
    prefBranch.deleteBranch(GlaxDigg.Digg.PREF_BRANCH);

    // close the database connection.
    GlaxDigg.Digg.DBService.connection.closeConnection();

    // remove the extension directory if possible.
    try {
      installFolder = GlaxDigg.Digg.getExtensionDirectory();
      if (installFolder.exists() && installFolder.isDirectory()) {
        installFolder.remove(true);
      }
    } catch (e) {
      // using debug instead of error because we know that the
      // sqlite file is not going to be removed if the connection is open.
      this._logger.error("_cleanUp. Error:\n" + e);

      // XXX: failed to remove directory, so lets remove contents recursively.
      if (installFolder.exists()) {
        let directoryEntries = installFolder.directoryEntries;
        let entry = null;

        while (directoryEntries.hasMoreElements()) {
          entry = directoryEntries.getNext();
          entry.QueryInterface(Ci.nsIFile);

          try {
            entry.remove(true);
          } catch (e) {
            // if a remove failed, proceed with the next file.
            // XXX: using debug instead of error because we know that the sqlite
            // file is not going to be removed if the connection is open.
            this._logger.error("_cleanUp. Error:\n" + e);
          }
        }
        // try one last time to remove the Glubble folder after we deleted its
        // contents.
        try {
          installFolder.remove(true);
        } catch (e) {
          // XXX: using debug instead of error because we know that the sqlite
          // file is not going to be removed if the connection is open.
          this._logger.error("_cleanUp. Error:\n" + e);
        }
      }
    }
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logger.debug("observe");

    switch(aTopic) {
      case TOPIC_QUIT_APPLICATION:
        if (this._shouldUninstall) {
          this._cleanUp();
        }
        break;
      case TOPIC_EM_ACTION_REQUESTED:
        aSubject.QueryInterface(Ci.nsIUpdateItem);

        if (GlaxDigg.Digg.EXTENSION_ID == aSubject.id) {
          switch(aData) {
            case "item-cancel-action":
              if (this._shouldUninstall) {
                this._shouldUninstall = false;
              }
              break;
            case "item-uninstalled":
              this._shouldUninstall = true;
              break;
          }
        }
        break;
    }
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.UninstallService);
