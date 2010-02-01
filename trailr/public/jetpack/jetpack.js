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
status = "on";

jetpack.statusBar.append({ 
// method="POST" action="http://linehive.com/create"
//<input type="button" id="clear" value="Clear">
	html: '<form method="GET"><input type="button" id="status_toggle" value="On"><input id="urls"><input type="button" id="clearer" value="Clear"><input type="button" id="send" value="Send to linehive" ></form>',
	width: 560,
	onReady: function(doc){
		// Fetch clipboard
		var setUrl = function (x){
			$("#urls",doc).attr("value",x);
		};
		var resetCounters = function (){
			content='';
			formattedContent='';
			numurls = 0;
			setUrl("0 links.");
		};
		var switchStatus = function(){
			if(status == "on"){
				status = "off";
				$("#status_toggle",doc).attr("value","Off");
			}
			else{
				status = "on";
				$("#status_toggle",doc).attr("value","On");
				//$("#status_toggle",doc).text("value","On");
			}
		}
		
		// Put the url into our array?
		if(! url_match.test(content)){
			content = '';
			setUrl("0 links.");
		}
		else {
			// Output currently grabbed urls
			setUrl("1 link. Most recent: "+content);
			
			content = escape(content);
			formattedContent = shortenFunction(content);
			numurls = 1;
		}
		
		var timer = function(){
		// Fetch clipboard
		  Ncontent = jetpack.clipboard.get("plain");
		  
		  // match the clipboard to 
		  if(status == "on" && url_match.test(Ncontent) && Ncontent!=Pcontent){
			
			numurls = numurls+1;
			Pcontent=Ncontent;
			content = content + escape(" " + Ncontent);
			formattedContent = formattedContent + shortenFunction(Ncontent);
			if(numurls == 1){
				setUrl("1 link. Most recent: "+content);
			}
			else{
				setUrl("" + numurls + " links. Most recent: "+Ncontent);
			}
			
			//var temp = allURLS.filter(shortenFunction);
			var myBody = "" + numurls + " links: "+ formattedContent;
			var myIcon ="http://www.linehive.com/images/jetpack.ico";
			var myTitle="linehive: Added link ("+Ncontent+")";
			jetpack.notifications.show({title: myTitle, body: myBody, icon: myIcon}); // 
		  }
		  if(status=="off"){
			Pcontent=Ncontent;
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
			jetpack.tabs.open('http://linehive.com/create?urls='+content);
			jetpack.tabs[ jetpack.tabs.length-1 ].focus();
			jetpack.notifications.show({title: "linehive: links created", body: "Customize your links on the new tab", icon: "http://www.linehive.com/images/jetpack.ico"});
			resetCounters();
		})
		$("#status_toggle",doc).click(function (doc){
			switchStatus();
		})
		$("#clearer",doc).click(function (doc) {			
			resetCounters();
		})
		$("#status_toggle", doc).css({
			width:40
		})
		$("form", doc).css({
			height:0,
			display:"hidden"
		})
		;
	}
});


/*
*/