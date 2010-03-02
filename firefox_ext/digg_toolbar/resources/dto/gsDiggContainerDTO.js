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

const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://digg/common/gsDiggCommon.js");
Cu.import("resource://digg/dto/gsDiggTopicDTO.js");

/**
 * Container DTO
 * Stores container info.
 */
GlaxDigg.Digg.ContainerDTO = function() {
  this._init();
}

GlaxDigg.Digg.ContainerDTO.prototype = {
  /* Logger for this object. */
  _logger : null,

  /* Container name */
  _name : null,
  /* Container short name */
  _shortName : null,
  /* Container topics */
  _topics : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.ContainerDTO");
    this._logger.debug("init");
  },

  /**
   * Returns the container name.
   * @return container name
   */
  get name() {
    this._logger.debug("name[get]");
    return this._name;
  },

  /**
   * Sets the container name.
   * @param aValue container name
   */
  set name(aValue) {
    this._logger.debug("name[set]");
    this._name = aValue;
  },

  /**
   * Returns the container short name.
   * @return container short name
   */
  get shortName() {
    this._logger.debug("shortName[get]");
    return this._shortName;
  },

  /**
   * Sets the container short name.
   * @param aValue container short name
   */
  set shortName(aValue) {
    this._logger.debug("shortName[set]");
    this._shortName = aValue;
  },

  /**
   * Returns the container topics.
   * @return container topics
   */
  get topics() {
    this._logger.debug("topics[get]");
    return this._topics;
  },

  /**
   * Sets the container topics.
   * @param aValue container topics
   */
  set topics(aValue) {
    this._logger.debug("topics[set]");
    this._topics = aValue;
  },

  /**
   * Populates the DTO from a JSON object.
   * @param aJSON the JSON object.
   */
  populateFromJSON : function(aJSON) {
    this._logger.debug("populateFromJSON");

    if (null != aJSON) {
      this.name = aJSON["name"];
      this.shortName = aJSON["short_name"];
      this.topics = this._populateTopics(aJSON["topics"]);
    }
  },

  /**
   * Populates topics from JSON object.
   * @param aJSON the JSON object.
   * @return the topics array.
   */
  _populateTopics : function(aJSON) {
    this._logger.trace("_populateTopics");

    let topicDTO = null;
    let topics = new Array();

    if (null != aJSON) {
      for (let i = 0; i < aJSON.length; i++) {
        topicDTO = new GlaxDigg.Digg.TopicDTO();
        topicDTO.populateFromJSON(aJSON[i]);

        topics.push(topicDTO);
      }
    }

    return topics;
  },

  /**
   * Gets the wrapped inner object.
   * XXX: this is a workaround so that we can pass this object through an
   * observer without having to explicitly declare an interface for it. See:
   * http://www.mail-archive.com/dev-tech-xpcom@lists.mozilla.org/msg01505.html
   */
  get wrappedJSObject() { return this; }
};
