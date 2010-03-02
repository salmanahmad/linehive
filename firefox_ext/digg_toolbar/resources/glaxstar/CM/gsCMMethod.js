/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/CM/gsCMCommon.js");

// Mnemonic regular expression.
const RE_MNEMONIC = /^[a-z][a-z0-9_]*$/i;
// Entry point regular expression.
const RE_ENTRY_POINT = /^\/(?:[^\/\s]+(?:\/)?)*$/;

/**
 * Represents a method in an API specification.
 */
GlaxDigg.CM.Method = function(
  aMnemonic, aEntryPoint, aProtocol, aMethod, aIsUpload, aEntryMethod) {
  this._init(
    aMnemonic, aEntryPoint, aProtocol, aMethod, aIsUpload, aEntryMethod);
}

GlaxDigg.CM.Method.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* The rememberable name of the method. */
  _mnemonic : null,
  /* The URL entry point that identifies this particular method. */
  _entryPoint : null,
  /* The protocol used to invoke this method. */
  _protocol : null,
  /* The method (GET or POST) used to send data. */
  _method : null,
  /* Indicates if this method includes a file upload or not. */
  _isUpload : false,
  /* The entry method if have one. */
  _entryMethod : null,

  /**
   * Initializes the method object.
   * @param aMnemonic the mnemonic associated to the method.
   * @param aEntryPoint the URL entry point to set on the method.
   * @param aProtocol the protocol to set on the method.
   * @param aMethod the method (GET or POST) used to send data. A null value
   * defaults to GET.
   * @param aIsUpload true if this method includes a file upload, false
   * otherwise.
   * @param aEntryMethod the entry method if have one.
   * @throws Exception if any of the parameters is invalid.
   */
  _init : function(
    aMnemonic, aEntryPoint, aProtocol, aMethod, aIsUpload, aEntryMethod) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.CM.Method");
    this._logger.trace("_init");

    if ((null == aMnemonic) || !RE_MNEMONIC.test(aMnemonic)) {
      this._logger.error("_init. Invalid mnemonic: " + aMnemonic);
      throw "The provided mnemonic is invalid.";
    }

    if ((null == aEntryPoint) || !RE_ENTRY_POINT.test(aEntryPoint)) {
      this._logger.error("_init. Invalid entry point: " + aEntryPoint);
      throw "The provided entry point is invalid.";
    }

    if (("http://" != aProtocol) && ("https://" != aProtocol)) {
      this._logger.error("_init. Invalid protocol: " + aProtocol);
      throw "The provided protocol is invalid.";
    }

    if ((null == aMethod) || ("" == aMethod)) {
      this._method = "GET";
    } else if (("GET" == aMethod) || ("POST" == aMethod)) {
      this._method = aMethod;
    } else {
      this._logger.error("_init. Invalid method (GET or POST): " + aMethod);
      throw "The provided method (GET or POST) is invalid.";
    }

    this._mnemonic = this._canonicMnemonic(aMnemonic);
    this._entryPoint = aEntryPoint;
    this._protocol = aProtocol;
    // this looks dumb, but it converts the value to boolean when necessary.
    this._isUpload = (true == aIsUpload);
    this._entryMethod = aEntryMethod;
  },

  /**
   * Returns the rememberable name of the method.
   * @return the rememberable name of the method.
   */
  get mnemonic() {
    this._logger.debug("get mnemonic");

    return this._mnemonic;
  },

  /**
   * Returns the URL entry point that identifies this particular method.
   * @return the URL entry point that identifies this particular method.
   */
  get entryPoint() {
    this._logger.debug("get entryPoint");

    return this._entryPoint;
  },

  /**
   * Returns the protocol used to invoke this method.
   * @return the protocol used to invoke this method.
   */
  get protocol() {
    this._logger.debug("get protocol");

    return this._protocol;
  },

  /**
   * Returns the method (GET or POST) used to send data.
   * @return the method (GET or POST) used to send data.
   */
  get method() {
    this._logger.debug("get method");

    return this._method;
  },

  /**
   * Indicates if this method includes a file upload or not.
   * @return true if this method includes a file upload, false otherwise.
   */
  get isUpload() {
    this._logger.debug("get isUpload");

    return this._isUpload;
  },

  /**
   * Returns the entry method.
   * @return the entry method.
   */
  get entryMethod() {
    this._logger.debug("get entryMethod");

    return this._entryMethod;
  },

  /**
   * Converts a mnemonic to a canonic camel casing. It's also the best method
   * name I've ever come up with :).
   * @param aMnemonic the mnemonic to convert.
   * @return canonic camel case version of the given mnemonic.
   * @throws Exception if the mnemonic is invalid.
   */
  _canonicMnemonic : function(aMnemonic) {
    this._logger.trace("_canonicMnemonic");

    let canonic = null;
    let split = aMnemonic.toLowerCase().split("_");
    let splitCount = split.length;
    let firstSection = true;
    let section;

    for (let i = 0; i < splitCount; i++) {
      section = split[i];
      // ignore empty sections (consecutive underscores).
      if ("" != section) {
        if (firstSection) {
          // keep the first section in lower case.
          canonic = section;
          firstSection = false;
        } else if (1 < section.length) {
          // capitalize the first letter of the section.
          canonic += (section.charAt(0).toUpperCase() + section.substring(1));
        } else {
          // capitalize the whole section (one letter only).
          canonic += section.toUpperCase();
        }
      }
    }

    if (firstSection) {
      this._logger.error("_canonicMnemonic. Invalid mnemonic: " + aMnemonic);
      throw "The provided mnemonic is invalid.";
    }

    return canonic;
  }
};
