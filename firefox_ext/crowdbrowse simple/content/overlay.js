var CrowdBrowse = {
	i:0,
	n:0,
	u:"",
	onLoad: function() {
		// Initialize
		this.initialized = true;	
		
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
			CrowdBrowseTimeline2.toggle();
		}
		else
			gBrowser.selectedTab = gBrowser.addTab("http://linehive.com");
	},
	launchSearch: function(){
		// Fire up search for most recently navigated page.
		gBrowser.selectedTab = gBrowser.addTab("http://localhost:3000/search/results?query="+CrowdBrowse.u);
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
  URLIndex : -1,
  init: function() {
    // Listen for webpage loads
    gBrowser.addProgressListener(myExt_urlBarListener,
        Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
  },
  
  uninit: function() {
    gBrowser.removeProgressListener(myExt_urlBarListener);
  },

  processNewURL: function(aURI) {
    if (aURI !=null && aURI.spec == this.oldURL)
      return;

    $.getJSON('http://localhost:3000/api/url?query='+encodeURIComponent(gBrowser.contentDocument.location), function(data) {
		trails = eval(data);
		if(trails.length>0)
		{
			$("#lh-button").attr("tooltiptext",trails.length+" linehives found for current location.\nClick to launch viewer for most popular line.");
			$(".lh-search-button").attr("tooltiptext",trails.length+" linehives from current location.\nClick here to view all.");
			$("#launchSearch-button").attr("tooltiptext",trails.length+" linehives from current location.\nClick here to view all.");
			$("#lh-button").css("list-style-image", 'url("chrome://crowdbrowse/skin/linehive.png")');
			CrowdBrowse.i = trails[0]['trail']['id'];
			CrowdBrowse.n = trails.length;
			
			$.getJSON('http://localhost:3000/api/line?query='+CrowdBrowse.i, function(data2) {
				articles = eval(data2);
				for(var i = 0; i<articles.length; i++)
				{
					
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
				$("#timelineOverlaySrc").attr('src',"http://localhost:3000/s/"+CrowdBrowse.i+"/"+myExtension.URLIndex+"/");
				//alert("http://localhost:3000/s/"+CrowdBrowse.i+"/"+myExtension.URLIndex+"/");
			});
//			alert(myExtension.URLIndex+"at the source !");
		}
		else
		{
			$("#lh-button").attr("tooltiptext",trails.length+" linehives from current location.");
			$("#lh-button").css("list-style-image", 'url("chrome://crowdbrowse/skin/linehive_desat.png")');
			CrowdBrowse.n = 0;
		}
		
	});
    this.oldURL = aURI.spec;
	CrowdBrowse.u = aURI.spec;
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
	// Add icon to the toolbar before the url-container
	setTimeout('addToToolbar();', 500);
}, false);
window.addEventListener("unload", function() {myExtension.uninit()}, false);

