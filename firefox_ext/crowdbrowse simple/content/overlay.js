var CrowdBrowse = {
u:0,
num:0,
	onLoad: function() {
		// initialization code
		this.initialized = true;	
	},
	click: function(){
		if(this.num > 0)
			gBrowser.selectedTab = gBrowser.addTab("http://localhost:3000/fullscreen/"+this.u);
		else
			gBrowser.selectedTab = gBrowser.addTab("http://linehive.com");
		CrowdBrowseTimeline2.toggle();
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
			$("#lh-button").attr("tooltiptext",trails.length+" linehives from current location.\nClick to launch viewer.");
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
function addToToolbar(){
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
	
window.addEventListener("load", function() {myExtension.init(); CrowdBrowse.onLoad();
    //setTimeout('show_toolbar_button("lh-button", "urlbar-container");', 1000);
	setTimeout('addToToolbar();', 500);
}, false);
window.addEventListener("unload", function() {myExtension.uninit()}, false);

/*function show_toolbar_button(id, before)
	{
		try {
			var nbr = document.getElementById("nav-bar");
			if (!nbr || nbr.currentSet.indexOf(id) != -1) {
				alert("WTF: nav bar not found");
				return;
			}
			var box = document.getElementById("navigator-toolbox");
			if (!box) {
				alert("WTF: nav toolbox not found");
				return;
			}
			var bar = box.firstChild;
			while (bar) {
				if (bar.currentSet && bar.currentSet.indexOf(id) != -1) {
					alert("WTF: no bars found");
					return;
				}
				bar = bar.nextSibling;
			}
			var target = document.getElementById(before);
			/* The before element might not exist in the nav-bar 
			var elem = nbr.firstChild;
			while (elem) {
				if (elem == target) {
					break;
				}
				elem = elem.nextSibling;
			}
			nbr.insertItem(id, elem, null, false);
			document.persist("nav-bar", "currentset");
			alert("Should be added?");
		} catch (e) {
			alert("wot_ui.show_toolbar_button: failed with " + e + "\n");
		}
	};
*/