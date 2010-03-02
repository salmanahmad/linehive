/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/CM/gsCMCommon.js");
Cu.import("resource://glaxdigg/Util/gsUtilUtilityService.js");

// URL validation Regular Expression.
const RE_URL =
  new RegExp(
    "(?:(?:(?:http|https|ftp|file)://)(?:w{3}\\.)?(?:[a-zA-Z0-9/;\\?&=:\\-_\\" +
    "$\\+!\\*'\(\\|\\\\~\\[\\]#%\\.])+)");
// Regular expression to obtain parameter strings from an entry point.
const RE_PARAM_IN_URL = /\/(\{([^\}]+)\})/g;

// Strings used to build multipart form submissions.
const MULTIPART_PARAM = "Content-Disposition: form-data; name=\"$(NAME)\"";
const MULTIPART_PARAM_FILE = MULTIPART_PARAM + "; filename=\"$(FILENAME)\"";

/**
 * This is the main communication service, from which the specification and
 * implementation objects of a given API are obtained.
 */
GlaxDigg.CM.CommunicationService = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initialize the object.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.CM.CommunicationService");
    this._logger.trace("_init");
  },

  /**
   * Obtains an API manifest from the given URL.
   * @param aLoadHandler the load handler for the manifest call.
   * @param aErrorHandler the error handler for the manifest call.
   * @param aURL the URL to get the manifest from.
   * @throws Exception if any of the arguments is invalid, or the call fails
   * before it's sent.
   */
  getManifest : function(aURL, aLoadHandler, aErrorHandler) {
    this._logger.debug("getManifest");

    let that = this;

    HTTPRequestSender.sendRequest(
      aURL, "GET", null, false,
      function(aEvent) {
        that._loadHandler(aEvent, aLoadHandler, aErrorHandler);
      },
      function(aEvent) {
        that._errorHandler(aEvent, aErrorHandler);
      });
  },

  /**
   * Internal load handler. Generates an object from the response and passes it
   * along to the handler passed by the caller.
   * @param aEvent the load event triggered by the request.
   * @param aLoadHandler the caller's load handler.
   * @param aErrorHandler the caller's error handler.
   */
  _loadHandler : function(aEvent, aLoadHandler, aErrorHandler) {
    this._logger.trace("_loadHandler");

    if (null != aLoadHandler) {
      let response = null;

      try {
        response = this.parseJSON(aEvent.target.responseText);
        aLoadHandler(response);
      } catch (e) {
        let error = null;

        this._logger.error("_loadHandler: The result didn't parse correctly.");

        try {
          error =
            this._getErrorObject(
              aEvent, "The received JSON object is invalid.");
        } catch (e) {
          this._logger.error(
            "_loadHandler: The error object wasn't generated correctly.");
        }

        aErrorHandler(error);
      }
    } else {
      this._logger.error("_loadHandler: A null load handler was given.");
    }
  },

  /**
   * Internal load handler. Generates an error object from the response and
   * passes it along to the handler passed by the caller.
   * @param aEvent the load event triggered by the error.
   * @param aErrorHandler the caller's error handler.
   */
  _errorHandler : function(aEvent, aErrorHandler) {
    this._logger.trace("_errorHandler");

    if (null != aErrorHandler) {
      let error = null;

      try {
        error = this._getErrorObject(aEvent);
      } catch (e) {
        this._logger.error(
          "_errorHandler: The error object wasn't generated correctly.");
      }

      aErrorHandler(error);
    } else {
      this._logger.error("_loadHandler: A null error handler was given.");
    }
  },

  /**
   * Creates an object that implements the API described in the given manifest.
   * @param aManifest the manifest object used to generate the implementation
   * object.
   * @param aDontParse [optional] true if the API responses should not be parsed
   * as JSON.
   * @return implementation object for the API described in the manifest.
   * @throws Exception if the manifest is invalid.
   */
  implementManifest : function(aManifest, aDontParse) {
    this._logger.debug("implementManifest");

    return new APIObject(aManifest, aDontParse);
  },

  /**
   * Generates an error object from a request error event.
   * @param aEvent the load event triggered by the error.
   * @param aMessage the message to set on the error object.
   * @return the error object that corresponds to the response error.
   * @throws Exception if the event is invalid.
   */
  _getErrorObject : function(aEvent, aMessage) {
    this._logger.trace("_getErrorObject");

    let request = aEvent.target;
    let errorCode = null;
    let errorMessage = null;

    try {
      errorCode = request.status;
      errorMessage = ((null == aMessage) ? request.statusText : aMessage);
    } catch (e) {
      errorCode = "CM0001";
      errorMessage =
        ((null == aMessage) ?
         "An error occurred in the request but no additional information was " +
         "provided." :
         aMessage);

      this._logger.warn(
        "_getErrorObject: The error object doesn't have information from the " +
        "response object.\n" + e);
    }

    return new GlaxDigg.CM.Error(errorCode, errorMessage, null);
  },

  /**
   * Parses the given JSON string and returns the generated object.
   * @param aJSONString the string used to initialize the object.
   * @throws Exception for any parse error that may occur.
   */
  parseJSON : function(aJSONString) {
    this._logger.debug("parseJSON");

    let json = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
    let parsed = null;

    try {
      parsed = json.decode(aJSONString);
    } catch (e) {
      this._logger.error("parseJSON. Parse error.\n" + e);
      throw "JSON parsing error";
    }

    return parsed;
  },

  /**
   * Outputs the contents of the given Javascript object as a POST string.
   * XXX: an object can be converted to POST only if it contains either:
   * - Simple (not object or array) values.
   * - String arrays.
   * - Arrays of objects with simple (not object or array) values.
   * - Object with string attributes only.
   * Different data structures are not guaranteed to work.
   * @return POST string representation of this object.
   * @throws Exception if the object doesn't have the expected structure.
   */
  toPOST : function(aObject) {
    this._logger.debug("toPOST");

    let post = "";

    if ((null != aObject) && ("object" == typeof(aObject))) {
      let attributeValue;
      let attributeType;
      let postName;

      for (let attribute in aObject) {
        attributeValue = aObject[attribute];
        attributeType = typeof(attributeValue);

        if ("" != post) {
          post += "&";
        }

        if ("object" == attributeType) {
          if (GlaxDigg.Util.UtilityService.isArray(attributeValue)) {
            let isStringArray = ("string" == typeof(attributeValue[0]));

            postName = attribute + "[]";

            if (0 != attributeValue.length) {
              if (isStringArray) {
                post += this._getStringArrayPOST(postName, attributeValue);
              } else {
                post += this._getObjectArrayPOST(postName, attributeValue);
              }
            } else {
              post += this._generatePOSTParameter(postName, "");
            }
          } else {
            for (let innerAttribute in attributeValue) {
              if ("string" == typeof(innerAttribute)) {
                postName = attribute + "[" + innerAttribute + "]";
                post +=
                  this._generatePOSTParameter(
                    postName, attributeValue[innerAttribute]) + "&";
              } else {
                this._logger.error(
                  "toPOST. Inner objects found in conversion to POST format.");
                throw "Inner objects found converting to POST.";
              }
            }
            // Remove the ending & fromt the string.
            post = post.substring(0, (post.length - 1));
          }
        } else {
          post += this._generatePOSTParameter(attribute, attributeValue);
        }
      }
    } else {
      this._logger.error("toPOST. Invalid object: " + aObject);
      throw "Invalid object to convert to POST.";
    }

    return post;
  },

  /**
   * Generates a POST string for a parameter with a given name and value.
   * @param aName the parameter name.
   * @param aValue the parameter value.
   * @return generated POST parameter string.
   */
  _generatePOSTParameter : function(aName, aValue) {
    this._logger.trace("_generatePOSTParameter");

    let postString = encodeURIComponent(String(aName));
    let valueString = encodeURIComponent(String(aValue));

    if ("" != valueString) {
      postString += ("=" + encodeURIComponent(String(aValue)));
    }

    return postString;
  },

  /**
   * Obtains the POST string from a string array.
   * @param aName the name of the POST parameter.
   * @param aArray the string array to set as value.
   * @return POST string for the given string array.
   */
  _getStringArrayPOST : function(aName, aArray) {
    this._logger.trace("_getStringArrayPOST");

    let arrayLength = aArray.length;
    let post = "";

    for (let i = 0; i < arrayLength; i++) {
      if (0 < i) {
        post += "&";
      }

      post += this._generatePOSTParameter(aName, aArray[i]);
    }

    return post;
  },

  /**
   * Obtains the POST string from an object array.
   * @param aName the name of the POST parameter.
   * @param aArray the object array to set as value.
   * @return POST string for the given object array.
   */
  _getObjectArrayPOST : function(aName, aArray) {
    this._logger.trace("_getObjectArrayPOST");

    let arrayLength = aArray.length;
    let post = "";
    let innerPOST;
    let innerPOSTParts;
    let innerPOSTPartLength;
    let part;
    let paramParts;
    let partName;
    let partValue;

    for (let i = 0; i < arrayLength; i++) {
      if (0 < i) {
        post += "&";
      }

      innerPOST = this.toPOST(aArray[i]);
      innerPOSTParts = innerPOST.split("&");
      innerPOSTPartLength = innerPOSTParts.length;

      for (let j = 0; j < innerPOSTPartLength; j++) {
        if (0 < j) {
          post += "&";
        }

        part = innerPOSTParts[j];
        paramParts = part.split("=");
        // get the original values because they are encoded.
        partName = "[" + decodeURIComponent(paramParts[0]) + "]";
        partValue = (paramParts[1] ? decodeURIComponent(paramParts[1]) : "");
        // generate the post string.
        post += this._generatePOSTParameter((aName + partName), partValue);
      }
    }

    return post;
  },

  /**
   * Outputs the contents of the given Javascript object as a multipart POST
   * stream. See
   * http://mxr.mozilla.org/firefox/source/content/html/content/src/
   * nsFormSubmission.cpp
   * XXX: an object can be converted to a multipart POST stream only if it
   * contains:
   * - Simple (not object or array) values.
   * - nsIFile pointers that correspond to files being uploaded.
   * Different data structures are not guaranteed to work.
   * @param aBoundary the boundary string used for the POST.
   * @return multipart POST stream representation of this object.
   * @throws Exception if the object doesn't have the expected structure.
   */
  toMultipartPOST : function(aObject, aBoundary) {
    this._logger.debug("toMultipartPOST");

    let outputStream = null;

    if ((null != aObject) && ("object" == typeof(aObject))) {
      let multiStream =
        Cc["@mozilla.org/io/multiplex-input-stream;1"].
          createInstance(Ci.nsIMultiplexInputStream);
      // no words.
      let mimeService = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService);
      let attributeValue;
      let attributeType;
      let stringStream;
      let str;

      for (let attribute in aObject) {
        attributeValue = aObject[attribute];

        if (attributeValue instanceof Ci.nsIFile) {
          // add file section to POST.
          let fileStream =
            Cc["@mozilla.org/network/file-input-stream;1"].
              createInstance(Ci.nsIFileInputStream);
          let fileInfo;
          let mime;

          // add the string header for the file data.
          fileInfo =
            MULTIPART_PARAM_FILE.replace(
              "$(NAME)", encodeURIComponent(attribute));
          fileInfo =
            fileInfo.replace(
              "$(FILENAME)", encodeURIComponent(attributeValue.leafName));

          try {
            mime = mimeService.getTypeFromFile(attributeValue);
          } catch (e) {
            this._logger.warn(
              "toMultipartPOST. MIME type could not be detected.\n" + e);
            mime = "application/octet-stream";
          }

          // add the Content-type section.
          str =
            ("--" + aBoundary + "\r\n" + fileInfo + "\nContent-Type: " + mime +
             "\r\n\r\n");

          stringStream =
            Cc["@mozilla.org/io/string-input-stream;1"].
              createInstance(Ci.nsIStringInputStream);
          stringStream.setData(str, str.length);
          multiStream.appendStream(stringStream);

          // append file stream.
          fileStream.init(
            attributeValue, -1, -1,
            (Ci.nsIFileInputStream.CLOSE_ON_EOF |
             Ci.nsIFileInputStream.REOPEN_ON_REWIND));
          multiStream.appendStream(fileStream);

          str = "\r\n";
          stringStream =
            Cc["@mozilla.org/io/string-input-stream;1"].
              createInstance(Ci.nsIStringInputStream);
          stringStream.setData(str, str.length);
          multiStream.appendStream(stringStream);
        } else {
          // add string section to POST.
          str =
            ("--" + aBoundary + "\r\n" +
             MULTIPART_PARAM.replace("$(NAME)", encodeURIComponent(attribute)) +
             "\r\n\r\n" + String(attributeValue) + "\r\n");
          stringStream =
            Cc["@mozilla.org/io/string-input-stream;1"].
              createInstance(Ci.nsIStringInputStream);
          stringStream.setData(str, str.length);
          multiStream.appendStream(stringStream);
        }
      }

      // add final boundary.
      str = ("--" + aBoundary + "--\r\n");
      stringStream =
        Cc["@mozilla.org/io/string-input-stream;1"].
          createInstance(Ci.nsIStringInputStream);
      stringStream.setData(str, str.length);
      multiStream.appendStream(stringStream);

      // convert everything to a MIME stream.
      outputStream =
        Cc["@mozilla.org/network/mime-input-stream;1"].
            createInstance(Ci.nsIMIMEInputStream);
      outputStream.addContentLength = true;
      outputStream.addHeader(
        "Content-Type", ("multipart/form-data; boundary=" + aBoundary));
      outputStream.setData(multiStream);
    } else {
      this._logger.error("toMultipartPOST. Invalid object: " + aObject);
      throw "Invalid object to convert to multipart POST.";
    }

    return outputStream;
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.CM.CommunicationService);

/**
 * Represents an API implementation object. This object will have its methods
 * generated dynamically using the provided manifest.
 */
function APIObject(aManifest, aDontParse) {
  this._init(aManifest, aDontParse);
};

APIObject.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* The manifest object. */
  _manifest : null,
  /* The currently selected domain index. */
  _selectedDomainIndex : -1,
  /* The currently selected domain. */
  _selectedDomain : null,
  /* Indicates if responses shouldn't be parsed as JSON. */
  _dontParse : false,

  /**
   * Initialize this API object with the given manifest object.
   * @param aManifest the manifest object holding the domains to use and methods
   * this object must implement.
   * @param aDontParse [optional] true if the API responses should not be parsed
   * as JSON.
   * @throws Exception if the manifest is invalid.
   */
  _init : function(aManifest, aDontParse) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.CM.CommunicationService.APIObject");
    this._logger.trace("_init");

    if ((null != aManifest) && aManifest.result) {
      let methodCount;
      let method;

      // set the local manifect object.
      this._manifest = aManifest;

      // select the first domain in the list.
      this._selectedDomainIndex = 0;
      this._selectedDomain = this._manifest.domains[0].hostname;
      methodCount = this._manifest.methods.length;

      // add functions for each method.
      for (let i = 0; i < methodCount; i++) {
        method = this._manifest.methods[i];
        this._addMethod(method);
      }

      this._dontParse = (("boolean" == typeof(aDontParse)) && aDontParse);
    } else {
      throw "The manifest is null or it contains errors.";
    }
  },

  /**
   * Adds a method to this object.
   * @param aMethod the method object that represents the method to add.
   */
  _addMethod : function(aMethod) {
    this._logger.trace("_addMethod");

    let that = this;

    this[aMethod.mnemonic] =
      function(aSendData, aLoadHandler, aErrorHandler, aHeaders) {
        that._logger.debug(aMethod.mnemonic);

        let url = aMethod.protocol + that._selectedDomain + aMethod.entryPoint;
        let domain = aMethod.protocol + that._selectedDomain;
        let fixedParameterCount = that._manifest.fixedParameters.length;
        let fixedParameter = null;
        let request;

        // the data to send may be null, so we need to create a new object to
        // add the fixed parameters.
        if ((null == aSendData) &&
            (0 < fixedParameterCount || null != aMethod.entryMethod)) {
          aSendData = new Object();
        }

        // Append fixed parameters.
        for (let i = 0; i < fixedParameterCount; i++) {
          fixedParameter = that._manifest.fixedParameters[i];
          aSendData[fixedParameter.name] = fixedParameter.value;
        }

        // Append entry method.
        if (null != aMethod.entryMethod) {
          aSendData["method"] = aMethod.entryMethod;
        }

        request =
          HTTPRequestSender.sendRequest(
            url, aMethod.method, aSendData, aMethod.isUpload,
            function(aEvent) {
              that._loadHandler(aEvent, aLoadHandler, aErrorHandler); },
            function(aEvent) { that._errorHandler(aEvent, aErrorHandler); },
            aHeaders);

        return request;
      };
  },

  /**
   * Internal load handler. Generates an object from the response and passes it
   * along to the handler passed by the caller.
   * @param aEvent the load event triggered by the request.
   * @param aLoadHandler the caller's load handler.
   * @param aErrorHandler the caller's error handler.
   */
  _loadHandler : function(aEvent, aLoadHandler, aErrorHandler) {
    this._logger.trace("_loadHandler");

    if (null != aLoadHandler) {
      let parseError = true;
      let response = null;
      let responseTarget = null;
      let error = null;

      try {
        if (!this._dontParse) {
          response =
            GlaxDigg.CM.CommunicationService.parseJSON(
              aEvent.target.responseText);
        } else {
          // when JSON parsing is not performed, just pass the XMLHttpRequest
          // object back to the caller.
          response = aEvent.target;
        }

        responseTarget = aEvent.target;
        parseError = false;
      } catch (e) {
        this._logger.error(
          "_loadHandler: The object wasn't generated correctly.");

        try {
          error =
            GlaxDigg.CM.CommunicationService._getErrorObject(
              aEvent, "The load handler or the received object is invalid.");
        } catch (e) {
          this._logger.error(
            "_loadHandler: The error object wasn't generated correctly.");
        }
      }

      if (!parseError) {
        aLoadHandler(response, responseTarget);
      } else {
        aErrorHandler(error, responseTarget);
      }
    } else {
      this._logger.warn("_loadHandler: A null load handler was given.");
    }
  },

  /**
   * Internal load handler. Generates an error object from the response and
   * passes it along to the handler passed by the caller.
   * @param aEvent the load event triggered by the error.
   * @param aErrorHandler the caller's error handler.
   */
  _errorHandler : function(aEvent, aErrorHandler) {
    this._logger.trace("_errorHandler");

    // change domains before moving on with the error flow.
    this._selectNextDomain();

    if (null != aErrorHandler) {
      let error = null;

      try {
        error = GlaxDigg.CM.CommunicationService._getErrorObject(aEvent);
      } catch (e) {
        this._logger.error(
          "_errorHandler: The error object wasn't generated correctly.");
      }

      aErrorHandler(error);
    } else {
      this._logger.warn("_loadHandler: A null error handler was given.");
    }
  },

  /**
   * Selects the next domain in the domain list.
   */
  _selectNextDomain : function() {
    this._logger.trace("_selectNextDomain");

    this._selectedDomainIndex =
      (this._selectedDomainIndex + 1) % this._manifest.domains.length;
    this._selectedDomain =
      this._manifest.domains[this._selectedDomainIndex].hostname;
  }
};

/**
 * Holds a single function in charge of sending HTTP requests for both the
 * communication service and the generated API objects.
 */
var HTTPRequestSender = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initialize the object.
   */
  _init : function() {
    this._logger =
      GlaxDigg.getLogger(
        "GlaxDigg.CM.CommunicationService.HTTPRequestSender");
    this._logger.trace("_init");
  },

  /**
   * Sends an asynchronous HTTP request to the URL with the arguments specified
   * in the given object. The callback function is called when the response is
   * received.
   * @param aURL the URL to send the request to.
   * @param aMethod the method (GET or POST) used to send the request.
   * @param aObject an object that holds the parameters to send to the
   * remote host by POST. It should be null in case there are no parameters to
   * send.
   * @param aIsUpload indicates if the send operation includes a file upload.
   * @param aLoadHandler the handler function to use when the response is
   * received correctly.
   * @param aErrorHandler the handler function to use when an error occurs in
   * the request.
   * @param aHeaders (optional) an object with name/value mappings for the
   * headers that have to be set for this request.
   * @return XMLHttpRequest object with the request that was sent.
   * @throws Exception if any of the arguments is invalid.
   */
  sendRequest : function(
    aURL, aMethod, aObject, aIsUpload, aLoadHandler, aErrorHandler, aHeaders) {
    this._logger.debug("sendRequest. URL: " + aURL + ", method: " + aMethod);

    let request = null;

    if ((null == aURL) || !RE_URL.test(aURL)) {
      this._logger.error("sendRequest: Invalid URL: " + aURL);
      throw "An invalid URL was provided.";
    }

    try {
      let isPOST = ("POST" == aMethod);
      let postValue;
      // Look for embedded parameters in the url. For each one, replace them
      // with its value from the object, or remove them if not found.
      let paramName = null;
      let match = RE_PARAM_IN_URL.exec(aURL);

      request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();

      while (match) {
        paramName = match[2];

        if (aObject && aObject[paramName]) {
          aURL = aURL.replace(match[1], aObject[paramName]);
          delete aObject[paramName];
        } else {
          aURL = aURL.replace(match[0], "");
        }

        match = RE_PARAM_IN_URL.exec(aURL);
      }

      // add event handlers.
      request.QueryInterface(Ci.nsIDOMEventTarget);
      request.addEventListener(
        "load", function(aEvent) { aLoadHandler(aEvent) }, false);
      request.addEventListener(
        "error", function(aEvent) { aErrorHandler(aEvent) }, false);
      this._logger.debug("sendRequest. Event listeners added.");

      // prepare the request.
      request.QueryInterface(Ci.nsIXMLHttpRequest);

      if (isPOST) {
        request.open(aMethod, aURL, true);

        if (aIsUpload) {
          let boundary =
            "---------------------------" +
            parseInt(Math.random() * 100000000000, 10);

          postValue =
            GlaxDigg.CM.CommunicationService.toMultipartPOST(aObject, boundary);
          request.setRequestHeader(
            "Content-Type", ("multipart/form-data; boundary=" + boundary));
        } else {
          postValue =
            ((null != aObject) ?
              GlaxDigg.CM.CommunicationService.toPOST(aObject) : "");
          request.setRequestHeader(
            "Content-Type", "application/x-www-form-urlencoded");
        }
      } else {
        let postConcat = (aURL.match(/\?/g) ? "&" : "?");

        postValue =
          ((null != aObject) ?
            GlaxDigg.CM.CommunicationService.toPOST(aObject) : "");
        request.open(aMethod, (aURL + postConcat + postValue), true);
        request.setRequestHeader(
          "Content-Type", "application/x-www-form-urlencoded");
      }

      // set extra headers.
      if (aHeaders) {
        for (let header in aHeaders) {
          if ("string" == typeof(aHeaders[header])) {
            request.setRequestHeader(header, aHeaders[header]);
          }
        }
      }

      this._logger.debug("sendRequest. Request opened.");

      request.setRequestHeader("Connection", "close");
      request.send((isPOST ? postValue : null));
      this._logger.debug("sendRequest. Request sent.");
    } catch (e) {
      this._logger.error("sendRequest: HttpRequest error.\n" + e);
      throw "An error occurred generating the HTTP Request.";
    }

    return request;
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(HTTPRequestSender);
