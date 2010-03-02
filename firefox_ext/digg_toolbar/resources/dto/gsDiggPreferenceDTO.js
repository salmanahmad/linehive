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

/**
 * Represents a preference.
 */
GlaxDigg.Digg.PreferenceDTO = function(aName, aValue) {
  this._init(aName, aValue);
}

GlaxDigg.Digg.PreferenceDTO.prototype = {
  /* Logger for this object. */
  _logger : null,

  /* The preference name. */
  _name : null,
  /* The preference value. */
  _value : null,

  /**
   * Initializes the object.
   * @param aName the preference name.
   * @param aValue the preference value.
   */
  _init : function(aName, aValue) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.PreferenceDTO");
    this._logger.trace("_init");

    this._name = aName;
    this._value = aValue;
  },

  /**
   * Gets the preference name.
   * @return the preference name.
   */
  get name() {
    this._logger.trace("get name");

    return this._name;
  },

  /**
   * Sets the preference name.
   * @param aValue the preference name.
   */
  set name(aValue) {
    this._logger.trace("set name");

    this._name = aValue;
  },

  /**
   * Gets the preference value.
   * @return the preference value.
   */
  get value() {
    this._logger.trace("get value");

    return this._value;
  },

  /**
   * Sets the preference value.
   * @param aValue the preference value.
   */
  set value(aValue) {
    this._logger.trace("set value");

    this._value = aValue;
  },

  /**
   * Gets the wrapped inner object.
   * XXX: this is a workaround so that we can pass this object through an
   * observer without having to explicitly declare an interface for it. See:
   * http://www.mail-archive.com/dev-tech-xpcom@lists.mozilla.org/msg01505.html
   */
  get wrappedJSObject() { return this; }
};
