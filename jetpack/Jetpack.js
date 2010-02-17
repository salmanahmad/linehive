jetpack.future.import("clipboard");

LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAQCAYAAABdsIz2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABURJREFUeNrElmtsFFUUx8+Zxz66u912227LFlosLQ9pDTY1pCoBK5AQsWCiCR/wLcQY7Be/qDFqDB8UoyYaNEYMH0SF+MUIiYJgE2MbUASpULDU2jdlWba77e7szs7MvZ7ZjjKW7raJTbjJL3Nn7mPO/95zz7nIOQd7ef/EVhCAQ5S74CyUggHY5gCjGQEOU/MZIkIohDnQQyxWQPYtgXj7O0InfcRsg7OlB25lkaZ/aMOuqQoinOWl8Dmv+6wP/K4UiLvI5EpqEYgMYVAnVQIWK4PU/o041C4CRw2Q5/rZI5ta1tOjhVhO7LYW6j/lq29/+KdvCT02EtuJL4kDM0zpIF4nlhJv0NiunMIyDjRVAejYeieLYANGO7p4yZ7zULyHDPdToynOawpkgKkamNDqMVrrh8wRFcUxlNgzebQ9T7RadfNHD+VZ9GfNdSaCRCPxneUt9rKBeMn2/nBOYZM/hUAo0MG9NLYk4828iow7G1n4aiO/OkIbEqMuWnYc8nIyLUTfKnVBgIwIx8DgnyrnA2DEnFBy76zeUjpL+21EwKqbC1o2gzC/rV6e1xWVc6VIx+7lVHfgvHtF9D65Qqk3/OpqlHgtuowgHSAviUpxVYpyTfwZBN7JUuKJzJDvqtrvg8yop4AzTJVMncF8hc3Srtv6sBz97f8w8gorEBWJAsAGNeHYnThZMU6u9SO69d8Et35SKlZjtENJEhY34o6okXAUoMDcJHA1S0l3kMi1sqjVOVG7m6YancdYwHMI0+ccPF5reFJrHe5cd/tE/zY/m9yhMXGzkRS3QEICNey60ZFCCAocJEYnjeaXhTQYKPRccZXs7SxdOb5zfoOcbJ3HIatuljSxbs7CjoSalxytuMtfH//rYHOk+2B1cqxwkXKtgZpWLVLC1SJnQZ6NmWAKUf/0hsIJyT38e1HNQFdRDVz2LVwz5A6u3zmVHuarOIm3/le4R9TXkKvtJ0MHfy1edsbBtG6Z6YMisNGqZHiYhAkcQabA5yFhwcGCYJkmSA+mRUc9tVUJ5Oq0t0/DLS43Cbt/YPTYQKH3vb4iXyuithWRbTUEzJrb41s45fCY3a1sKpaZQXVzQbQIQzgQSKU/WXk91gFQO592mnnzA+KKzWaVWE1sm5Owvcc7w3GnY6izMth2vLpSuxQoWqBIYh1HXBB2u4pIpOw0mFGhJCfMAGEgdpcnU12LJxIXGsMRo3k0XLVoMumDF++JzbOwj4nL03P+nIUpsqS7DKNpU9/Iuw/0Dfdedzk7dAHPUa46fSngj2VEcdKb0RLLxuM6nTUvQyzyaHpDoZp5ivZtnSoKhWlRbHLPbqx1E8hGPMF68jx9hbnYn7PBk6ZTIsBzaRlPOTRheyDJHucU/QwilBgDM8mRGNAoKZsuKVIQRkZjuBMyEj8jMXzBo0F0DrvQRPxhs8OMeDuInhtxNyvIvggzCZ6pfrOwQy0RiBbq8b5Q+sPaEde+ZQMF3mBMXhWYkOoLFbGKzlGZdaVSSGsk5jWGr/nV3t6FaeX08sTF8qjcHxyX4dHZhZmbWjftprGFeNt6T1m3HNlKvpkZ5jByJOubhR1cH8le9UQDQ72V6Te/b4olRIYdxZPSKU9KbKfdM6xxHmRYmnQbdbQQj+ki1+jy2HaxmjIprXUOYYes/LN2mqHmfNeIY7Zv3xA1xGbiONE3w3yniRHr/no4/80j/a8rDzp0fIWe+4gnYj7dIAGqbZXMbC3SrmmyjkeJXfQ+NssuHSG6ifZpZ0q0XPGCre8vxEfEdeKLHPP1E3uIFcTX9oa/BRgABP8VGCRx5RsAAAAASUVORK5CYII%3D'
url_match = /^https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/;

content = jetpack.clipboard.get("plain");

jetpack.statusBar.append({ 
	/*html: '<form method="GET"><input type="button" id="status_toggle" value="On"><input id="urls"><input type="button" id="clearer" value="Clear"><input type="button" id="send" value="Send to linehive"></form>',*/
	html: '<img src="'+LOGO+'"><div id="add" class="button">Add link</div><div id="create" class="button">Create line (3)</div> | <a title="Lines containing the current page">Viewing</a>: <div id="nav" class="button"><a id="prev">\<</a> <a id="current" title="Chinese couple finally take figure skating gold in 2010 after tumultuous history">Chinese couple finally ... (3/4)<a id="next">\></a></div> <a id="diff" class="button">Switch lines (1 of 4)</a>',
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
		$("#urls", doc).css({
			width:350,
			height:20,
			left: 20,
			fontSize: "12px",
			cursor: "pointer",
			backgroundColor: "rgba(255,255,255,.8)"
		})
		$(".button", doc).css({
			fontSize: "12px",
			cursor: "pointer",
			paddingLeft:0,
			marginLeft:10,
			backgroundColor: "rgba(255,255,255,.8)",
			display: "inline"
		})
		$("#clearer",doc).click(function (doc) {			
			resetCounters();
		})
		$("#add",doc).click(function (doc) {			
			jetpack.notifications.show("Added: "+jetpack.tabs.focused.contentWindow.location);
		})
		$("#create",doc).click(function (doc) {			
			jetpack.notifications.show("Open new page");
		})
		$("#prev",doc).click(function (doc) {			
			jetpack.notifications.show("Prev item");
		})
		$("#current",doc).click(function (doc) {			
			jetpack.notifications.show("open linehive search");
		})
		$("#next",doc).click(function (doc) {			
			jetpack.notifications.show("Next item");
		})
		$("#diff",doc).click(function (doc) {			
			jetpack.notifications.show("Next line!");
		})
		/*jetpack.tabs.focused.contentWindow.location*/
		$("form", doc).css({
			height:0,
			display:"hidden"
		})
		;
	}
});