/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = ["GlaxDigg"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/log4moz.js");

/**
 * GlaxDigg namespace. This is the root namespace for all our JCM objects.
 */
if ("undefined" == typeof(GlaxDigg)) {
  var GlaxDigg = {
    /* The FUEL Application object. */
    _application : null,
    /* Reference to the observer service. */
    _observerService : null,

    /**
     * Initializes the object and sets up logging for the whole extension.
     */
    _init : function() {
      // The basic formatter will output lines like:
      // DATE/TIME  LoggerName LEVEL  (log message)
      let formatter = new Log4Moz.GlaxFormatter();
      let root = Log4Moz.repository.rootLogger;
      let logFile = this.getProfileDirectory();
      let app;

      logFile.append("log.txt");

      // Loggers are hierarchical, lowering this log level will affect all
      // output.
      root.level = Log4Moz.Level["All"];

      // A console appender outputs to the JS Error Console.
      // app = new Log4Moz.ConsoleAppender(formatter);
      // app.level = Log4Moz.Level["All"];
      // root.addAppender(app);

      // A dump appender outputs to standard out.
      //app = new Log4Moz.DumpAppender(formatter);
      //app.level = Log4Moz.Level["Warn"];
      //root.addAppender(app);

      // this appender will log to the file system.
      app = new Log4Moz.RotatingFileAppender(logFile, formatter);
      app.level = Log4Moz.Level["Warn"];
      root.addAppender(app);

      // get the observer service.
      this._observerService =
        Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
    },

    /**
     * Gets a logger repository from Log4Moz.
     * @param aName the name of the logger to create.
     * @param aLevel (optional) the logger level.
     * @return the generated logger.
     */
    getLogger : function(aName, aLevel) {
      let logger = Log4Moz.repository.getLogger(aName);

      logger.level = Log4Moz.Level[(aLevel ? aLevel : "All")];

      return logger;
    },

    /* The FUEL Application object. */
    get Application() {
      // use lazy initialization because the FUEL object is only available for
      // Firefox and won't work on XUL Runner builds.
      if (null == this._application) {
        try {
          this._application =
            Cc["@mozilla.org/fuel/application;1"].
              getService(Ci.fuelIApplication);
        } catch (e) {
          throw "The FUEL application object is not available.";
        }
      }

      return this._application;
    },

    /* The observer service. */
    get ObserverService() { return this._observerService; },

    /**
     * Gets a reference to the directory where the extension will keep its
     * files. The directory is created if it doesn't exist.
     * @return reference (nsIFile) to the extension directory.
     */
    getProfileDirectory : function() {
      // XXX: there's no logging here because the logger initialization depends
      // on this method.

      let directoryService =
        Cc["@mozilla.org/file/directory_service;1"].
          getService(Ci.nsIProperties);
      let profDir = directoryService.get("ProfD", Ci.nsIFile);

      profDir.append("Glaxstar");

      if (!profDir.exists() || !profDir.isDirectory()) {
        // read and write permissions to owner and group, read-only for others.
        profDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
      }

      return profDir;
    }
  };

  /**
   * Constructor.
   */
  (function() {
    this._init();
  }).apply(GlaxDigg);
}
