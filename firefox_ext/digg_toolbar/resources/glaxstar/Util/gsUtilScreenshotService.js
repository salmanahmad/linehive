/**
 * Copyright (c) 2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/Util/gsUtilCommon.js");

// Timeout that allows the content to load in the hidden browser for screenshots
// for URLs.
const WINDOW_LOAD_TIMEOUT = 4 * 1000; // 4 seconds.

/**
 * Generates screenshots from content in the browser and creates image files
 * from the generated data.
 */
GlaxDigg.Util.ScreenshotService = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initializes the object.
   */
  _init : function() {
    this._logger =
      GlaxDigg.getLogger("GlaxDigg.Util.ScreenshotService");
    this._logger.trace("_init");
  },

  /**
   * Generates a screenshot from the given window, using the given dimensions
   * and image type.
   * @param aWindow the window to generate the thumbnail for.
   * @param aWidth (optional) the expected width of the image, in pixels.
   * Defaults to the width of the window.
   * @param aHeight (optional) the expected height of the image, in pixels.
   * Defaults to the height of the window.
   * @param aType (optional) the type of image to generate (image/png (default),
   * image/jpeg).
   * @param aMinWidth (optional) the minimum width the content area will have,
   * in pixels. This is used to prevent narrow windows from deforming the image
   * too much.
   * @return 'data:' URL with the image data in the specified format.
   */
  getWindowScreenshot : function(aWindow, aWidth, aHeight, aType, aMinWidth) {
    this._logger.debug("getWindowScreenshot");

    if (!(aWindow instanceof Ci.nsIDOMWindow)) {
      this._logger.error(
        "getWindowScreenshot. Invalid window argument: " + aWindow);
      throw "Invalid window argument.";
    }

    let canvas =
      aWindow.document.createElementNS(
        "http://www.w3.org/1999/xhtml", "canvas");
    let width = aWindow.innerWidth;
    let height = aWindow.innerHeight + aWindow.scrollMaxY;
    let canvasWidth = ((aWidth && (0 < aWidth)) ? aWidth : width);
    let canvasHeight = ((aHeight && (0 < aHeight)) ? aHeight : height);
    let scale;
    let canvasCtx;

    // set canvas dimensions.
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // adjust width to minimum if necessary.
    if (aMinWidth && (0 < aMinWidth) && (width < aMinWidth)) {
      width = Math.min(aMinWidth, (width + aWindow.scrollX));
    }

    scale = canvasWidth / width;

    // generate canvas with screenshot.
    canvasCtx = canvas.getContext("2d");
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.save();
    canvasCtx.scale(scale, scale);
    canvasCtx.drawWindow(aWindow, 0, 0, width, height, "rgb(255,255,255)");
    canvasCtx.restore();

    // generate image data and return.
    return canvas.toDataURL((aType ? aType : "image/png"), "");
  },

  /**
   * Generates a screenshot for the content located at the given URL.
   * @param aURL the URL to take the screenshot of.
   * @param aCallback callback method. Two parameters are passed to it:
   * the thumbnail image data, and the document title.
   * @param aWidth (optional) the expected width of the image, in pixels.
   * Defaults to the width of the window.
   * @param aHeight (optional) the expected height of the image, in pixels.
   * Defaults to the height of the window.
   * @param aType (optional) the type of image to generate (image/png (default),
   * image/jpeg).
   * @param aMinWidth (optional) the minimum width the content area will have,
   * in pixels. This is used to prevent narrow windows from deforming the image
   * too much.
   */
  getScreenshotForURL : function(
    aURL, aCallback, aWidth, aHeight, aType, aMinWidth) {
    this._logger.debug("getScreenshotForURL");

    if (("string" != typeof(aURL)) || !(/^(http|about|file)/.test(aURL)) ||
        ("function" != typeof(aCallback))) {
      this._logger.error(
        "getScreenshotForURL. Invalid arguments. URL: " + aURL +
        ", callback: " + aCallback);
      throw "Invalid arguments to get screenshot from URL.";
    }

    let windowMediator =
      Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);
    let lastWindow = windowMediator.getMostRecentWindow("navigator:browser");

    if (lastWindow) {
      // XXX : fix a reserved slot index out of range error I see in the error
      // console
      var domLoaded = false;
      let that = this;
      let panelContainer = lastWindow.gBrowser.mPanelContainer;
      let browser;
      let onFullyLoaded;
      let onPageShow;

      // set up a hidden browser element that will load the URL.
      browser = lastWindow.document.createElement("browser");
      browser.setAttribute("type", "content");
      panelContainer.appendChild(browser);
      // XXX: why are these flags necessary?
      browser.webNavigation.allowAuth = true;
      browser.webNavigation.allowImages = true;
      browser.webNavigation.allowJavascript = true;
      browser.webNavigation.allowMetaRedirects = true;
      browser.webNavigation.allowSubframes = true;

      // setup a load handler.
      onFullyLoaded = function() {
        let imageData =
          that.getWindowScreenshot(
            browser.contentWindow, aWidth, aHeight, aType, aMinWidth);
        let title = browser.contentDocument.title;

        try {
          browser.destroy();
        } catch (e) {
          // XXX: not logging, this action may fail for odd reasons.
        }

        panelContainer.removeChild(browser);
        aCallback(imageData, title);
      };

      // XXX: use this event for web pages, it guarantees the there is DOM and
      // a title.
      onDOMLoaded = function(aEvent) {
        domLoaded = true;
        browser.removeEventListener("DOMContentLoaded", onDOMLoaded, false);
        if (browser.contentWindow) {
          lastWindow.setTimeout(onFullyLoaded, WINDOW_LOAD_TIMEOUT);
        }
      };

      // XXX: we need the page show event in case the DOMContentLoaded is not
      // fired after 5 seconds. This happens for images.
      onPageShow = function(aEvent) {
        browser.removeEventListener("pageshow", onPageShow, false);
        lastWindow.setTimeout(
          function() {
            if (browser.contentWindow  && !domLoaded) {
              browser.removeEventListener(
                "DOMContentLoaded", onDOMLoaded, false);
              onFullyLoaded();
            }
          }, 5000);
      }

      // add listener and load the URL.
      browser.addEventListener("DOMContentLoaded", onDOMLoaded, false);
      browser.addEventListener("pageshow", onPageShow, false);
      browser.loadURI(aURL);
    } else {
      this._logger.error(
        "getScreenshotForURL. There are no browser windows open.");
      throw "The screenshot can't be taken if no browser windows are open.";
    }
  },

  /**
   * Saves the screenshot data into a binary image file.
   * @param aData the image data to save. It should be a data: URL, like the
   * ones produced by other methods in this service.
   * @param aFile the nsIFile object representing the file to save to.
   * @param aProgressListener (optional) a progress listener object that will
   * notify the progress of generating and saving the file.
   */
  saveScreenshot : function(aData, aFile, aProgressListener) {
    this._logger.debug("saveScreenshot");

    if (("string" != typeof(aData)) || (0 != aData.indexOf("data:image")) ||
        !(aFile instanceof Ci.nsIFile)) {
      this._logger.error(
        "saveScreenshot. Invalid arguments.\nData: " + aData + "\nFile:" +
        aFile);
      throw "Invalid arguments to save screenshot.";
    }

    let ioService =
      Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    let persist =
      Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].
        createInstance(Ci.nsIWebBrowserPersist);
    let imageURI = ioService.newURI(aData, "UTF8", null);

    persist.persistFlags =
      (Ci.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
       Ci.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION);

    if (aProgressListener) {
      persist.progressListener = aProgressListener;
    }

    // save the canvas data to the file
    persist.saveURI(imageURI, null, null, null, null, aFile);
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Util.ScreenshotService);
