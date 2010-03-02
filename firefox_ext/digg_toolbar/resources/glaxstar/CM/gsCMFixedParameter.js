/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/CM/gsCMCommon.js");

/**
 * Represents a fixed parameter in an API specification.
 */
GlaxDigg.CM.FixedParameter = function(aName, aValue) {
  this._init(aName, aValue);
}

GlaxDigg.CM.FixedParameter.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* Name */
  _name : null,
  /* Value */
  _value : null,

  /**
   * Initializes the fixed parameter object.
   * @param aName The name of the fixed parameter.
   * @param aValue The value of the fixed parameter.
   * @throws Exception is the name or value are invalid.
   */
  _init : function(aName, aValue) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.CM.FixedParameter");
    this._logger.trace("_init");

    if (null == aName) {
      this._logger.error("_init. Invalid name (null).");
      throw "The name provided is invalid (null).";
    }
    if (null == aValue) {
      this._logger.error("_init. Invalid value (null).");
      throw "The value provided is invalid (null).";
    }

    this._name = aName;
    this._value = aValue;
  },

  /**
   * Returns the name of the fixed parameter.
   * @return The name of the fixed parameter.
   */
  get name() {
    this._logger.debug("get name");

    return this._name;
  },

  /**
   * Returns the value of the fixed parameter.
   * @return The value of the fixed parameter.
   */
  get value() {
    this._logger.debug("get value");

    return this._value;
  }
};
