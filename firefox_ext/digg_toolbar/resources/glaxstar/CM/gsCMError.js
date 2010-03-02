/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/CM/gsCMCommon.js");

/**
 * Represents an error from the API.
 */
GlaxDigg.CM.Error = function(aErrorCode, aErrorMessage, aForParameter) {
  this._init(aErrorCode, aErrorMessage, aForParameter);
}

GlaxDigg.CM.Error.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* The identifier of the type of error that occurred. */
  _errorCode : null,
  /* The message associated to the error. */
  _errorMessage : null,
  /* The name of the parameter that caused the error. */
  _forParameter : null,

  /**
   * Initializes the error object.
   * @param aErrorCode the identifier of the type of error that occurred.
   * @param aErrorMessage the message associated to the error.
   * @param aForParameter the name of the parameter that caused the error.
   * @throws Exception if any of the parameters is invalid.
   */
  _init : function(aErrorCode, aErrorMessage, aForParameter) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.CM.Error");
    this._logger.trace("_init");

    if ((null == aErrorCode) || ("" == aErrorCode)) {
      this._logger.error("_init. Invalid error code: " + aErrorCode);
      throw "The error code provided is invalid.";
    }
    // an empty string and null are equivalent for this parameter.
    if ("" != aForParameter) {
      this._forParameter = aForParameter;
    }

    this._errorCode = aErrorCode;
    this._errorMessage = aErrorMessage;
  },

  /**
   * Returns the identifier of the type of error that occurred.
   * @return the identifier of the type of error that occurred.
   */
  get errorCode() {
    this._logger.debug("get errorCode");

    return this._errorCode;
  },

  /**
   * Returns the message associated to the error.
   * @return the message associated to the error.
   */
  get errorMessage() {
    this._logger.debug("get errorMessage");

    return this._errorMessage;
  },

  /**
   * Returns the name of the parameter that caused the error.
   * @return the name of the parameter that caused the error.
   */
  get forParameter() {
    this._logger.debug("get forParameter");

    return this._forParameter;
  }
};
