var CrowdBrowse = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
	
  },
  onMenuItemCommand: function() {
    window.open("chrome://helloworld/content/notification.xul", "", "chrome");
	//window.open("chrome://helloworld/content/example.xul", "", "chrome");
  
  // ! Jquery does not work $("#wtf").css("color", "blue"); Also, http://stackoverflow.com/questions/491490/how-to-use-jquery-in-firefox-extension :(
  // Create ajax calls through 
  // Look to digg toolbar for notification style copy
  // Look to wot for constant url checking
  // XUL is very constricted for html
    alert("HI");
  }
};



window.addEventListener("load", function(e) { CrowdBrowse.onLoad(e); }, false); 
