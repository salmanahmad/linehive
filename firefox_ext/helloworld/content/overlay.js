var HelloWorld = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
	
  },
  onMenuItemCommand: function() {
    window.open("chrome://helloworld/content/wtf.xul", "", "chrome");
  }
};

window.addEventListener("load", function(e) { HelloWorld.onLoad(e); }, false); 

var htmltip = {

onLoad: function() {
	//at any point you can save a HTML string to a XUL attribute for later injection into the tooltip
	document.getElementById("htmltip1").setAttribute("tooltipHTML", "<font color='red'>red foo</font>")
	document.getElementById("htmltip2").setAttribute("tooltipHTML", "<font color='green'>green foo</font>")
		
},

onMouseTooltip: function(event) {

//get the HTML tooltip string assigned to the element that the mouse is over (which will soon launch the tooltip)
var txt = event.target.getAttribute("tooltipHTML");

// get the HTML div element that is inside the custom XUL tooltip
var div = document.getElementById("myHTMLTipDiv");

//clear the HTML div element of any prior shown custom HTML 
while(div.firstChild) 
	div.removeChild(div.firstChild);

//safely convert HTML string to a simple DOM object, striping it of javascript and more complex tags
var injectHTML = Components.classes["@mozilla.org/feed-unescapehtml;1"] 
.getService(Components.interfaces.nsIScriptableUnescapeHTML) 
.parseFragment(txt, false, null, div); 

//attach the DOM object to the HTML div element 
div.appendChild(injectHTML); 
  
}

}

window.addEventListener('load', htmltip.onLoad, false);
