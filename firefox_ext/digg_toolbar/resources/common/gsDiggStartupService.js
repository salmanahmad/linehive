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
Cu.import("resource://digg/common/gsDiggAPIService.js");
Cu.import("resource://digg/service/gsDiggContainerService.js");
Cu.import("resource://digg/service/gsDiggEventNotifier.js");

// Preference keys.
const PREF_KEY_FIRST_RUN = GlaxDigg.Digg.PREF_BRANCH + "firstRun";

/**
 * Startup service
 * Performs startup operations.
 */
GlaxDigg.Digg.StartupService = {
  /* Logger for this object. */
  _logger : null,
  /* Flag to handle first run when api connects. */
  _firstRun : false,
  /* Flag that indicates whether the setup wizard has been shown */
  _setupWizardShown : false,

  /**
   * Initializes the component
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.StarupService");
    this._logger.debug("init");

    this._checkIfFirstRun();

    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.APIService.TOPIC_API_CONNECTED, false);
    GlaxDigg.Digg.APIService.initialize();
  },

  /**
   * Indicates whether or not this is the first time the user is running the
   * extension.
   * @return true if this is the first run, false otherwise.
   */
  get isFirstRun() {
    this._logger.debug("isFirstRun[get]");

    return this._firstRun;
  },

  /**
   * Indicates whether or not the setup wizard has been shown already.
   * @return true if it has been shown already, false if not.
   */
  get setupWizardShown() {
    this._logger.debug("setupWizardShown[get]");

    return this._setupWizardShown;
  },

  /**
   * Activates the setup wizard shown flag.
   */
  setSetupWizardShown : function() {
    this._logger.debug("setSetupWizardShown");

    this._setupWizardShown = true;
  },

  /**
   * Checks if its a first run.
   */
  _checkIfFirstRun : function() {
    this._logger.trace("_checkIfFirstRun");

    let firstRunPref = GlaxDigg.Application.prefs.get(PREF_KEY_FIRST_RUN);

    if (firstRunPref && firstRunPref.value) {
      GlaxDigg.Application.prefs.setValue(PREF_KEY_FIRST_RUN, false);
      this._firstRun = true;
    }
  },

  /**
   * Runs the startup procedures that depend on having a connection with the
   * API.
   */
  _startConnection : function() {
    this._logger.trace("_startConnection");

    if (this._firstRun) {
      GlaxDigg.Digg.ContainerService.setDefaultContainers();
    } else {
      GlaxDigg.Digg.EventNotifier.initialize();
    }
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe: function(aSubject, aTopic, aData) {
    this._logger.debug("observe");

    if (GlaxDigg.Digg.APIService.TOPIC_API_CONNECTED == aTopic) {
      if ("true" == aData) {
        this._startConnection();
      }
    }
  }
};

/**
 * Constructor.
 */
(function() {
  this.init();
}).apply(GlaxDigg.Digg.StartupService);
