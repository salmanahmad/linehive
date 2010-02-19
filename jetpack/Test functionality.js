jetpack.future.import("pageMods");
var locatio = jetpack.tabs.focused.contentWindow.location;
var doc = jetpack.tabs.focused.contentDocument; 
// Tried: 
// var doc = jetpack.tabs.focused.contentDocument.all; 
//var doc = jetpack.tabs.focused.contentDocument; 
//var doc = jetpack.tabs.focused.contentDocument.html; 
//var doc =  jetpack.tabs.focused.contentWindow
/*

http://www.w3schools.com/jsref/default.asp
#div-1a {
 position:absolute;
 top:0;
 right:0;
 width:200px;
}
*/
function openRedditPanel( anchor ){
doc.
  jetpack.panels.open({
    url: "http://m.reddit.com",
    anchor: anchor,
    align: "bottom right with anchor top right"
  });
}
function addToPage(){

}
jetpack.statusBar.append({
  html: "Reddit",
  onReady: function(widget) {

    $(widget).click(function(){
      var time = $("<div />", doc);
      time.addClass("noteButtonTime");
      time.text("WLKEJLKDSJFLKDJSFLKJDSLFKJDSLFJSLDKF");
      jetpack.notifications.show("HI");
      //doc.append("HELLO WORLD"); 
	  doc.title = "WTF";
	  //$(doc).find("body").css({border:"3px solid #000000"});
	  $(doc).find("body").children().hide();
	//$(doc).find("body").text('<div class="floattop">Please overlay absolutely!</div>');
	$(doc).find("body").append('<div class="floattop">Please overlay absolutely!</div>');
	  //$(doc).find("body").prepend($('<h1>Sorry this site is blacklisted until 17:00. sadface.</h1>'));
	  jetpack.notifications.show("HI2"+doc);
	  // Tried doc.write
	  	$(".floattop", doc).css({
			fontSize: "30px",
			cursor: "pointer",
			backgroundColor: "rgba(255,255,255,.8)",
			display: "inline", 
			position: "absolute",
			top:0,
			right:0,
			border:"3px solid black"
		});
    });
  },
});
