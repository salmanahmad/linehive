function resizeIframe() {
	// Resize our iframe as we need to
	var Wwidth = document.documentElement.clientWidth;
	$('#timelineOverlay').width(Wwidth);
};

var CrowdBrowse = {
	i:0,
	n:0,
	u:"",
	onLoad: function() {
		// Initialize the window manager
		this.initialized = true;
		this._windowManager =     Cc["@mozilla.org/appshell/window-mediator;1"].        getService(Ci.nsIWindowMediator);
		// Set up interaction
		//var button = document.getElementById("launchCrowdbrowse-button");
		//button.addEventListener('command',this.launchCrowdbrowse,true);
		var button2 = document.getElementById("launchSearch-button");
		button2.addEventListener('command',this.launchSearch,true);
	},
	launchCrowdbrowse: function(){
		// Either fire up our embed overlay or open browser for linehive
		if(CrowdBrowse.n > 0){
			//var popupSrc = document.getElementById("timelineOverlaySrc"); 
			CrowdBrowse.toggle();
		}
		else
			gBrowser.selectedTab = gBrowser.addTab("http://linehive.com");
	},
	launchSearch: function(){
		// Fire up search for most recently navigated page.
		gBrowser.selectedTab = gBrowser.addTab("http://localhost:3000/search/results?query="+CrowdBrowse.u);
	},
	_isViewerVisible : function() 
	{
		var popup = document.getElementById("timelineOverlay");
		return ("open" == popup.state);
	},
	toggle : function()  // Show or hide the overlay
	{
		if (this._isViewerVisible()) {
			this._hide();
		} else {
			this._show();
		}
	},
	_hide : function()  // hide the overlay
	{
		var popup = document.getElementById("timelineOverlay");
		if ("open" == popup.state) 
		{
			popup.hidePopup();
		}
	},
	_show : function() // Show the overlay
	{ 
		var popup = document.getElementById("timelineOverlay");
		var win = this._windowManager.getMostRecentWindow("navigator:browser");
		var documentHasFocus = window.document.hasFocus();
		var event = null;

		if (win != window || this._isViewerVisible() || !documentHasFocus) { return;    }
		//event = this._loadEvent();
		if ("open" != popup.state) 
		{
			var popup;
			popup = document.getElementById("timelineOverlay");
			var anchor = document.getElementById("nav-bar");
			popup.openPopup(anchor, "after_start", 0, 0, false, false);
		}
	}
};

// Class to start a listener for url navigation
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
  URLIndex : -1,
  init: function() {
    // Wrap around the listener
    gBrowser.addProgressListener(myExt_urlBarListener,
        Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
  },
  
  uninit: function() {
    gBrowser.removeProgressListener(myExt_urlBarListener);
  },

  processNewURL: function(aURI) {
    if (aURI !=null && aURI.spec == this.oldURL)
      return;

	// Query our server based upon incoming url.
    $.getJSON('http://localhost:3000/api/url?query='+encodeURIComponent(gBrowser.contentDocument.location), function(data) {
		trails = eval(data);
		if(trails.length>0)
		{
			// Something was found! Let's update the different parts of our xul layout.
			$("#lh-button").attr("tooltiptext",trails.length+" linehives found for current location.\nClick to launch viewer for most popular line.");
			$(".lh-search-button").attr("tooltiptext",trails.length+" linehives found for current location.\nClick here to view all.");
			$("#launchSearch-button").attr("tooltiptext",trails.length+" linehives found for current location.\nClick here to view all.");
			$("#lh-button").css("list-style-image", 'url("chrome://crowdbrowse/skin/linehive.png")');
			CrowdBrowse.i = trails[0]['trail']['id'];
			CrowdBrowse.n = trails.length;
			
			// Fetch data from our server to ask about the current line.
			$.getJSON('http://localhost:3000/api/line?query='+CrowdBrowse.i, function(data2) {
				articles = eval(data2);
				for(var i = 0; i<articles.length; i++)
				{
					
					// Manual check to mark which is our active url
					if(articles[i]['article']['url'] == gBrowser.contentDocument.location){
						myExtension.URLIndex = i;
						break;
						//alert(myExtension.URLIndex+"matched it!");
						//alert("YES! "+articles[i]['article']['url']);
					}
					else{
						//alert("No, :( "+articles[i]['article']['url']);
					}
				}
				
				// Change the iframe so the popup is fast!
				$("#timelineOverlaySrc").attr('src',"http://localhost:3000/s/"+CrowdBrowse.i+"/"+myExtension.URLIndex+"/");
				// alert("http://localhost:3000/s/"+CrowdBrowse.i+"/"+myExtension.URLIndex+"/");
			});
		}
		else
		{
			$("#lh-button").attr("tooltiptext",trails.length+" linehives found for current location.");
			$(".lh-search-button").attr("tooltiptext",trails.length+" linehives found for current location.");
			$("#launchSearch-button").attr("tooltiptext",trails.length+" linehives found for current location.");
			
			$("#lh-button").css("list-style-image", 'url("chrome://crowdbrowse/skin/linehive_desat.png")');
			CrowdBrowse.n = 0;
		}
		
	});
    this.oldURL = aURI.spec;
	CrowdBrowse.u = aURI.spec;
  }
};

// Add the overlay to the toolbar
function addToToolbar()
{
	 try {
		var firefoxnav = document.getElementById("nav-bar");
		var curSet = firefoxnav.currentSet;
		if (curSet.indexOf("lh-button") == -1)
		{
			var set;
			// Place the button before the urlbar
			if (curSet.indexOf("urlbar-container") != -1){
				set = curSet.replace(/urlbar-container/, "lh-button,urlbar-container");
				//set = curSet + ",lh-button";
			}
			else  // at the end
				set = curSet + ",lh-button";
			firefoxnav.setAttribute("currentset", set);
			firefoxnav.currentSet = set;
			document.persist("nav-bar", "currentset");
			// If you don't do the following call, funny things happen
			try {
				BrowserToolboxCustomizeDone(true);
			}
			catch (e) { alert ("Browser configuration not completed.");}
		}
	}
	catch(e) {  alert ("Browser configuration not completed.");}
};
	
window.addEventListener("load", function() 
{
	myExtension.init();  // Add a listener to our tab navigation
	CrowdBrowse.onLoad(); // Add an onload function for our querying service
	setTimeout('addToToolbar();', 500); // Add icon to the toolbar before the url-container after all the items have initialized
}, false);

window.addEventListener("unload", function() {myExtension.uninit()}, false);

window.onresize = resizeIframe;