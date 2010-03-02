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
Cu.import("resource://digg/dto/gsDiggContainerDTO.js");

// Preference keys.
const PREF_KEY_NOTIFY_CONTAINER =
  GlaxDigg.Digg.PREF_BRANCH + "notify.container.list";

/**
 * Container service.
 */
GlaxDigg.Digg.ContainerService = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.ContainerService");
    this._logger.trace("_init");
  },

  /**
   * Obtains the array of containers, each containing an array of topics inside.
   * @param aLoadHandler the callback method.
   */
  listContainers : function(aLoadHandler) {
    this._logger.debug("listContainers");

    let that = this;

    GlaxDigg.Digg.APIService.readAPI.getAllContainers(
      null,
      function(aResult) {
        that._listContainersLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._listContainersLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the listContainers method.
   * @param aResult The result returned by the server.
   * @param aLoadHandler The method callback.
   */
  _listContainersLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_listContainersLoadHandler");

    try {
      if (!aResult["error"] && aResult["containers"]) {
        let containersArray = aResult["containers"];
        let containers = new Array();
        let containerDTO = null;

        for (let i = 0; i < containersArray.length; i++) {
          containerDTO = new GlaxDigg.Digg.ContainerDTO();
          containerDTO.populateFromJSON(containersArray[i]);

          containers.push(containerDTO);
        }

        aLoadHandler(containers);
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_listContainersLoadHandler: Error received: " +
            aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_listContainersLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  },

  /**
   * Sets the default containers pref.
   */
  setDefaultContainers : function() {
    this._logger.debug("setDefaultContainers");

    let that = this;
    let callback = function(aResults) {
      that._setDefaultContainersLoadHandler(aResults);
    };

    try {
      this.listContainers(callback);
    } catch(e) {
      this._logger.error("setDefaultContainers:\n" + e);
    }
  },

  /**
   * Handles the response from the listContainers method. Sets the default
   * values of the containers preference.
   * @param aResults The array of objects in the response.
   */
  _setDefaultContainersLoadHandler : function(aResults) {
    this._logger.trace("_setDefaultContainersLoadHandler");

    let containerList = "";

    if (aResults && 0 < aResults.length) {
      let containerDTO = null;

      for (let i = 0; i < aResults.length; i++) {
        containerDTO = aResults[i];
        containerList += "\"" + containerDTO.shortName + "\",";
      }
      if (containerList != "") {
        containerList = containerList.substr(0, containerList.length - 1);
      }
    }

    GlaxDigg.Application.prefs.setValue(
      PREF_KEY_NOTIFY_CONTAINER, containerList);
  },

  /**
   * Obtains the array of topics.
   * @param aLoadHandler the callback method.
   */
  listTopics : function(aLoadHandler) {
    this._logger.debug("listTopics");

    let that = this;

    GlaxDigg.Digg.APIService.readAPI.getAllTopics(
      null,
      function(aResult) {
        that._listTopicsLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._listTopicsLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the listTopics method.
   * @param aResult The result returned by the server.
   * @param aLoadHandler The method callback.
   */
  _listTopicsLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_listTopicsLoadHandler");

    try {
      if (!aResult["error"] && aResult["topics"]) {
        let topicsArray = aResult["topics"];
        let topics = new Array();
        let topicDTO = null;

        for (let i = 0; i < topicsArray.length; i++) {
          topicDTO = new GlaxDigg.Digg.TopicDTO();
          topicDTO.populateFromJSON(topicsArray[i]);

          topics.push(topicDTO);
        }

        aLoadHandler(topics);
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_listTopicsLoadHandler: Error received: " + aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_listTopicsLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.ContainerService);
