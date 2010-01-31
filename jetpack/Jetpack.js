jetpack.future.import("clipboard");

// Shorten the url
var shortenFunction = function (x){
	if(x.length>30) return x.substr(0,30)+"...";
	return x;			
};


content = jetpack.clipboard.get("plain");
formattedContent = "";
Pcontent= content;
// is the clipboard a url?
url_match = /^https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/;
numurls = 0;
Ncontent= '';

jetpack.statusBar.append({ 
// method="POST" action="http://localhost:3000/create"
//<input type="button" id="clear" value="Clear">
	html: '<form method="GET"><input id="urls"><input type="button" id="clearer" value="Clear"><input type="button" id="send" value="Send to linehive" ></form>',
	width: 530, 
	onReady: function(doc){
		// Fetch clipboard
		var setUrl = function (x){
			$("#urls",doc).attr("value",x);
		};
		var resetCounters = function (){
			content='';
			formattedContent='';
			numurls = 0;
			setUrl("Links (0). Most recent: None.");
		};
		
		// Put the url into our array?
		if(! url_match.test(content)){
			content = '';
			setUrl("Links ("+numurls+"). Most recent: None. ");
		}
		else {
			content = escape(content);
			formattedContent = shortenFunction(content);
			numurls = 1;
			// Output currently grabbed urls
			setUrl("Links ("+numurls+"). Most recent: "+content);
		}
		
		
		
		
		var timer = function(){
		// Fetch clipboard
		  Ncontent = jetpack.clipboard.get("plain");
		  
		  // match the clipboard to 
		  if(url_match.test(Ncontent) && Ncontent!=Pcontent){
			
			numurls = numurls+1;
			Pcontent=Ncontent;
			content = content + escape(" " + Ncontent);
			formattedContent = formattedContent + shortenFunction(Ncontent);
			setUrl("Links ("+numurls+"). Most recent: "+Ncontent);
			
			//var temp = allURLS.filter(shortenFunction);
			var myBody = "Current links ("+numurls+"): "+ formattedContent;
			var myIcon ="http://www.linehive.com/images/jetpack.ico";
			var myTitle="linehive: Added link ("+Ncontent+")";
			jetpack.notifications.show({title: myTitle, body: myBody, icon: myIcon}); // 
		  }
		  
		}
		setInterval(timer , 2000)
		$("#urls", doc).css({
			width:350,
			height:20,
			left: 20,
			fontSize: "12px",
			cursor: "pointer",
			backgroundColor: "rgba(255,255,255,.8)"
		})
		$("#send",doc).click(function (doc) {
			jetpack.tabs.open('http://localhost:3000/create?url='+content);
			jetpack.tabs[ jetpack.tabs.length-1 ].focus();
			jetpack.notifications.show({title: "linehive: links created", body: "Customize your links on the new tab", icon: "http://www.linehive.com/images/jetpack.ico"});
			resetCounters();
		})
		$("#clearer",doc).click(function (doc) {			
			resetCounters();
		})
		$("form", doc).css({
			height:0,
			display:"hidden"
		});

	}
});

