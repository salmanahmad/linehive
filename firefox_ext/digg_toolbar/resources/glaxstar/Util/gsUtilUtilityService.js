/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/Util/gsUtilCommon.js");

// Operating system regular expressions.
const RE_OS_WINDOWS = /^Win/i;
const RE_OS_MAC = /^Mac/i;
const RE_OS_LINUX = /^Linux/i;
const RE_OS_WINDOWS_VISTA = /Windows NT 6.0/i;

// Regular expression to check a valid email address.
// See http://www.regular-expressions.info/email.html
const RE_EMAIL_ADDRESS = /^[a-z0-9._%+-]+@(?:[a-z0-9-]+\.)+[a-z]{2,4}$/i;
// Array constructor regular expression.
const RE_ARRAY_CONSTRUCTOR = /^function Array\(\)/;

/**
 * Utility service. Contains some general utility methods that are commonly
 * used in our extensions.
 */
GlaxDigg.Util.UtilityService = {
  /* Logger for this object. */
  _logger : null,
  /* The version of the application this is running on (full version number). */
  _version : null,
  /* Identifier for the operating system this extension is running on. */
  _os : null,

  /**
   * Initialize the component.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Util.UtilityService");
    this._logger.trace("_init");
  },

  // Operating system constant getters.
  get OS_MAC() { return 0; },
  get OS_WINDOWS() { return 1; },
  get OS_WINDOWS_VISTA() { return -1; },  // :P
  get OS_LINUX() { return 2; },
  get OS_OTHER() { return 3; },

  /**
   * Obtains an identifier for the operating system this extension is running
   * on.
   * @return any of the OS constants defined in this interface.
   */
  getOperatingSystem : function() {
    this._logger.debug("getOperatingSystem");

    let operatingSystem = this.OS_OTHER;

    if (null == this._os) {
      let appShellService =
        Cc["@mozilla.org/appshell/appShellService;1"].
          getService(Ci.nsIAppShellService);
      let platform = appShellService.hiddenDOMWindow.navigator.platform;

      if (platform.match(RE_OS_MAC)) {
        operatingSystem = this.OS_MAC;
      } else if (platform.match(RE_OS_WINDOWS)) {
        let userAgent = appShellService.hiddenDOMWindow.navigator.userAgent;

        if (userAgent.match(RE_OS_WINDOWS_VISTA)) {
          operatingSystem = this.OS_WINDOWS_VISTA;
        } else {
          operatingSystem = this.OS_WINDOWS;
        }
      } else if (platform.match(RE_OS_LINUX)) {
        operatingSystem = this.OS_LINUX;
      } else {
        operatingSystem = this.OS_OTHER;
      }
    } else {
      operatingSystem = this._os;
    }

    return operatingSystem;
  },

  /**
   * Gets the application version this extension is running on.
   * @return application version this extension is running on (full version
   * number).
   */
  get version() {
    this._logger.debug("get version");

    if (null == this._version) {
      let appInfo =
        Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

      this._version = appInfo.version;
    }

    return this._version;
  },

  /**
   * Obtains a reference to the defaults folder for a specific extension.
   * @param aExtensionID the ID of the extension.
   * @return nsIFile reference to the defaults folder for the extension matching
   * the given ID.
   */
  getDefaultsFolder : function(aExtensionID) {
    this._logger.debug("getDefaultsFolder. ID: " + aExtensionID);

    let extensionManager =
      Cc["@mozilla.org/extensions/manager;1"].
        getService(Ci.nsIExtensionManager);
    let defaultsFolder =
      extensionManager.getInstallLocation(aExtensionID).
        getItemLocation(aExtensionID);

    defaultsFolder.append("defaults");

    return defaultsFolder;
  },

  /**
   * Trims a string (both start and end).
   * @param aString the string to be trimmed.
   * @return the trimmed string.
   */
  trim : function(aString) {
    this._logger.debug("trim");

    return aString.replace(/^\s+|\s+$/g, '');
  },

  /**
   * Returns true if the given string is null or empty.
   * @param aString the string to check.
   * @return true if the string is null or empty. Returns false otherwise. Note
   * that this method returns false for strings with blank characters, like " ".
   */
  isNullOrEmpty : function(aString) {
    this._logger.debug("isNullOrEmpty");

    return ((null == aString) || (0 == aString.length));
  },

  /**
   * Returns true if the given string is a valid email address.
   * @param aString the string to check.
   * @return true if the string is a valir email address. Returns false
   * otherwise. Note that this method returns false for empty an null strings.
   */
  isValidEmailAddress : function(aString) {
    this._logger.debug("isValidEmailAddress");

    return (!this.isNullOrEmpty(aString) && RE_EMAIL_ADDRESS.test(aString));
  },

  /**
   * Generates a UUID.
   * @return an UUID.
  */
  generateUUID : function() {
    this._logger.debug("generateUUID");

    var uuidGenerator =
      Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator);
    var uuid = uuidGenerator.generateUUID().toString();

    // Remove the brackets from the generated UUID
    if (uuid.indexOf("{") == 0 ) {
      uuid = uuid.substring(1, (uuid.length - 1));
    }

    return uuid;
  },

  /**
   * Returns an array of elements that match the given aXPathExpression,
   * from the aXMLNode specified, using xpath.
   * @param aXMLNode the XML node or document to search for matches.
   * @param aXPathExpresion the xpath expression to be used in the search.
   * @return array with the elements that matched the xpath expression.
   */
  evaluateXPath : function (aXMLNode, aXPathExpression) {
    this._logger.debug("evaluateXPath");

    let matches = [];
    let xpe =
      Cc["@mozilla.org/dom/xpath-evaluator;1"].
        getService(Ci.nsIDOMXPathEvaluator);

    let nsResolver =
      xpe.createNSResolver(
        ((null == aXMLNode.ownerDocument) ? aXMLNode.documentElement :
         aXMLNode.ownerDocument.documentElement));
    let result = xpe.evaluate(aXPathExpression, aXMLNode, nsResolver, 0, null);
    let res = result.iterateNext();

    while (res) {
      matches.push(res);
      res = result.iterateNext();
    }

    return matches;
  },

  /**
   * Indicates if the given object is an array or not.
   * This code is based on code from:
   * http://snipplr.com/view/1996/typeof--a-more-specific-typeof/
   * @return true if the object is an array, false otherwise.
   */
  isArray : function(aObject) {
    this._logger.debug("isArray");

    let isArray =
      ((null != aObject) && ("object" == typeof(aObject)) &&
       (RE_ARRAY_CONSTRUCTOR.test(aObject.constructor.toString())));

    return isArray;
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Util.UtilityService);
