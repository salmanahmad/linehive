var CrowdBrowse = {
u:0,
num:0,
onLoad: function() {
		// initialization code
		this.initialized = true;		
	},
onMenuItemCommand: function() {
		window.open("chrome://crowdbrowse/content/notification.xul", "", "chrome");
		//window.open("chrome://crowdbrowse/content/example.xul", "", "chrome");

		// ! Jquery does not work $("#wtf").css("color", "blue"); Also, http://stackoverflow.com/questions/491490/how-to-use-jquery-in-firefox-extension :(
		// Create ajax calls through 
		// Look to digg toolbar for notification style copy
		// Look to wot for constant url checking
		// XUL is very constricted for html
	},
click: function(){
	if(this.num > 0)
		gBrowser.selectedTab = gBrowser.addTab("http://localhost:3000/fullscreen/"+this.u);
}
};

var myExt_urlBarListener = {
  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
     return this;
   throw Components.results.NS_NOINTERFACE;
  },

  onLocationChange: function(aProgress, aRequest, aURI)
  {
    myExtension.processNewURL(aURI);
  },

  onStateChange: function(a, b, c, d) {},
  onProgressChange: function(a, b, c, d, e, f) {},
  onStatusChange: function(a, b, c, d) {},
  onSecurityChange: function(a, b, c) {}
};

var myExtension = {
  oldURL: null,
  
  init: function() {
    // Listen for webpage loads
    gBrowser.addProgressListener(myExt_urlBarListener,
        Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
  },
  
  uninit: function() {
    gBrowser.removeProgressListener(myExt_urlBarListener);
  },

  processNewURL: function(aURI) {
    if (aURI.spec == this.oldURL)
      return;
    $.getJSON('http://localhost:3000/api/url?query='+encodeURIComponent(gBrowser.contentDocument.location), function(data) {
		trails = eval(data);
		if(trails.length>0)
		{
			$("#lh-button").attr("tooltiptext",trails.length+" linehives from current location.\nClick to launch full screen mode.");
			$("#lh-button").css("list-style-image", 'url("chrome://crowdbrowse/skin/linehive.png")');
			CrowdBrowse.u = trails[0]['trail']['id'];
			CrowdBrowse.num = trails.length;
		}
		else
		{
			$("#lh-button").attr("tooltiptext",trails.length+" linehives from current location.");
			$("#lh-button").css("list-style-image", 'url("chrome://crowdbrowse/skin/linehive_desat.png")');
			CrowdBrowse.num = 0;
		}
		
	});
    this.oldURL = aURI.spec;
  }
};

window.addEventListener("load", function() {myExtension.init(); CrowdBrowse.onLoad();}, false);
window.addEventListener("unload", function() {myExtension.uninit()}, false);

