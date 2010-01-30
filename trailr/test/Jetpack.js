jetpack.future.import("clipboard");

jetpack.statusBar.append({ // method="POST" action="http://localhost:3000/create"
	html: '<input id="count">',//<input type="button" value="Send to Trailr" onClick="openTab">',
	width: 400, 
	onReady: function(doc){
		// Fetch clipboard
		var content = jetpack.clipboard.get("plain");
		var Pcontent= content;
		var allURLs = [];
		// is the clipboard a url?
		var url_match = /^https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/;
		var numurls = 0;
		
		// Put the url into our array?
		if(! url_match.test(content))	
			content = '';
		else {
			allURLs[numurls] = escape(content);
			numurls = 1;
		}
		
		// Output currently grabbed urls
		$("#count",doc).attr("value","Links ("+numurls+"). Most recent: "+content);
		//$("#count",doc).text("Links ("+numurls+"). Most recent: "+content);
		
		var timer = function(){
		// Fetch clipboard
		  var Ncontent = jetpack.clipboard.get("plain");
		  
		  // match the clipboard to 
		  if(url_match.test(Ncontent) && Ncontent!=Pcontent){
			
			numurls = numurls+1;
			Pcontent=Ncontent;
			content = content + " " + escape(Ncontent);
			
			$("#count",doc).attr("value","Links ("+numurls+"). Most recent: "+Ncontent);
			
			// Shorten the url
			var shortenFunction = function (x){
				if(x.length>20) return x.substr(0,100)+"...";
				return x;			
			};

			//var temp = allURLS.filter(shortenFunction);
			var myBody = "Current links ("+numurls+"): "+ shortenFunction(content);
			var myIcon ="http://www.mozilla.com/favicon.ico";
			var myTitle="Added link ("+Ncontent+")";
			jetpack.notifications.show({title: myTitle, body: myBody, icon: myIcon});
		  }
		  
		}
		setInterval(timer , 2000)
		$("#count", doc).css({
			width:380,
			height:20,
			left: 20,
			fontSize: "12px",
			cursor: "pointer",
			backgroundColor: "rgba(255,255,255,.8)"
		})
		$("form", doc).css({
			height:0,
			display:"hidden"
		});
	}
});

jetpack.statusBar.append({ 
	html: '<input type="button" value="Send to Trailr" >',
	width:120,
	onReady:function(widget){
		$(widget).click( function(){
			jetpack.tabs.open('http://localhost:3000/create?');
			jetpack.tabs[ jetpack.tabs.length-1 ].focus();
			var lkasjdf = jetpack.tabs.focused.contentWindow.wrappedJSObject;
			asdlf
		});
	}
});
