// BEGIN TIMELINE NAMESPACE

var shortenUrl = function (x){
	if(x.length>40) return x.substr(0,40)+"...";
	return x;			
};

var timeline = {
	gap_threshold:.15,
	show_meta:true,
	min_date:null,
	max_date:null,
	zoom_stack:[],
	overlap:0.5,
	months: [],
	duration:1000,
	use_clustering:false,
	
	init: function(datas) {
		console.log("init");
		
		this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		
		for(i in datas) {
			
			var data = datas[i];
			
			if(data == null) {
				continue;
			}
						
			//this.add(data["article"]);
			this.add(data);			
		}
		
		this.draw();
	},
	setScale:function(min, max) {
		this.min_date = min;
		this.max_date = max;
	},
	zoomIn:function(min, max) {
		var scale = {};
		scale["min"] = this.min_date;
		scale["max"] = this.max_date;
		
		this.zoom_stack.push(scale);
		
		this.setScale(min, max);
	},
	zoomOut:function() {
		
		if(this.zoom_stack.length > 0) {
			var scale = this.zoom_stack.pop();
			this.setScale(scale["min"], scale["max"]);
		}
	},
	computeScale:function() {
		if(this.min_date == null || this.max_date == null) {
			return null;
		} else if(this.max_date == this.min_date) {
			return 86400000; // One day in ms
		} else {
			return this.max_date - this.min_date;
		}
	},
	isUnitScale:function() {
		if((this.max_date == this.min_date) && this.max_date != null) {
			return true;
		} else {
			return false;
		}		
	},
	addTemplate:function(info) {
		var template = $("#add.template").html();

		if($("#timeline.noedit").size() == 0) {
			var edit_template = '<input type="text" value="$format" class="date_edit" />';
			template = template.replace(/\$format/g, edit_template);
		} 

		// I need this to no mess up the event count later one...
		template = template.replace(/\$class/g, 'event');		
		template = template.replace(/\$headline/g, info.headline);
		
		template = template.replace(/\$url/g, info.url);
		template = template.replace(/\$source/g, info.source);
		
		// I need to do this to avoid a server call back...
		template = template.replace(/\$img_src/g, info.image_url);		
		template = template.replace(/\$image/g, '<img src="' + info.image_url + '" />');
		template = template.replace(/\$date/g, info.date);
		template = template.replace(/\$format/g, info.format);
		template = template.replace(/\$pictures/g, info.pictures);
		
		console.log(template);

		return template;
	},
	add: function(e) {
		
		console.log("add");
		
		var date = new Date(Date.parse(e["date"]));
		if(date == "Invalid Date") {
			date = new Date();
		}
		
		
		
		var m = this.months
		var date_format = date.toDateString();
		date_format = ""  + m[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
		
		
		
		var pictures_data = "";
		var pictures = e["pictures"];
		for(i in pictures) {
			pictures_data += '<li><img src="' + pictures[i] + '" /></li>';
		}
		
		
		
		var headline = e["headline"];
		if (headline == null || headline == "null") {
			headline = "Title Not Available";
		}
		
		
				
		var info = {};
		info.headline = headline;
		info.url = e["url"];
		info.source = e["source"];
		info.image_url = e["image_url"];
		info.date = date.toUTCString();
		info.format = date_format;
		info.pictures = pictures_data;
						
		var template = this.addTemplate(info);
		
		$("#timeline .events").append(template);
		
		if($("#timeline.noedit").size() == 0) {
		
			//$(".date_edit").datepicker({dateFormat: 'MM d, yy', 
			$(".date_edit").datepicker({dateFormat: 'M d, yy', 			
										changeMonth:true, 
										changeYear:true,
										showButtonPanel:true,
										currentText:'Show Today',
										onClose:this.updateDate,
										closeText:'Cancel',
										yearRange:'-25:0'});

		} else {
			$(".date_edit").attr("disabled", true);
			$("#timeline .events .event > .headline").autoEllipsis();
		}
		
		
		

	},     
	updateDate:function(dateText, instance) {
		var date = new Date(Date.parse(dateText));
		var date_string = date.toUTCString();
		
		$(this).parents(".event").children(".info").children(".date").text(date_string);
		
		timeline.draw();
	},                                            
	remove:function() {                                
		console.log("remove");                           
		this.draw();                                     
	},                                                 
	draw: function() {                                 
		console.log("draw");                             
		
		$(".gap").remove();
		
		// How or hide the empty tag which displays an image to the user indicating there
		// are no events currently available to be visualized                                                 
		if($(".event").size() == 0) {                    
			$(".empty").show();                            
		} else {                                         
			$(".empty").hide();                            
		}                                                
		
		var count = $(".event").size();
		
		if(count > 0) {
			var event_width = $(".event:first").outerWidth();
			var event_total_width = event_width * count;
			var timeline_width = $("#timeline").outerWidth();
			var start_left = 0;
			var midde = (timeline_width / 2) - (event_width / 2);
			
			if(event_total_width < timeline_width ) {
				start_left = (timeline_width/2) - (event_total_width/2);
			}
			
			var events = [];
			$(".event").each(function(index, element) {
				if($(this).children(".insert").size() != 0) {
					$(this).css("left", midde);
					$(this).children(".insert").remove();
				}
				
				var date = new Date(Date.parse($(this).children(".info").children(".date").text()));
				
				events.push({e:$(this), d: date});
				
			});

			events.sort(function(a, b) {

				//var date1_text = $(a).children(".info").children(".date").text();
				//var date2_text = $(b).children(".info").children(".date").text();			

				//var date1 = new Date(Date.parse(date1_text));
				//var date2 = new Date(Date.parse(date2_text));
				
				var date1 = a.d;
				var date2 = b.d;
				
				return date1 - date2;

			});
			
			
			var left = start_left;
			var max_date = events[events.length - 1].d;
			var min_date = events[0].d;
			var date_range = max_date.getTime() - min_date.getTime();
			
			var one_year=1000*60*60*24*365;
			
			
			for(var i in events) {
				var event = events[i].e;
				
				console.log(events.length);
				
				
				
				//$(event).animate({ left: left }, this.duration + 100 * 2, "easeOutBounce");
				//$(event).animate({ left: left }, this.duration, "easeOutQuad");
				//$(event).animate({ left: left }, this.duration * 2, "easeOutElastic");
				
				$(event).animate({ left: left }, this.duration, "easeOutCirc");

				left += event_width;				

				i = parseInt(i);
				if((i + 1) < events.length) {
					
					var current_date = events[i].d; 
					var next_date = events[(i+1)].d;
					var diff = next_date.getTime() - current_date.getTime();
					
					if(diff / date_range > timeline.gap_threshold) {
						var gap = '<div class="gap"></div>'

						$(".events").append(gap);
						$(".gap:last").animate({ left: left }, this.duration, "easeOutCirc");
						left += 15;						
					}
					

					
				}


				

				
				
				
			}
				
		}
		
	}
}

// END TIMELINE NAMESPACE

var meta_show_callback = null;

$(function() {
	
	var current_event = null;
	
	function addCustomImage() {
		if(current_event != null) {
						
			var src = $(".pick_custom_image_text").val();
			
			
			$(current_event).children(".thumbnail").children("a").children("img").attr("src", src);
			$(current_event).children(".info").children(".image").text(src);

			$("#image_picker_cover").hide();
			$("#image_picker").hide();
			
			current_event = null;
		}
	}

	$(".pick_custom_image_text").keypress(function(event) {
		if(event.which == 13) {
			addCustomImage();
			return false;
		}
	});
	$(".pick_custom_image_button").click(addCustomImage);


	$("#timeline #image_picker ul li").live("click", function() {
		if(current_event != null) {
						
			var src = $(this).children("img").attr("src");
			$(current_event).children(".thumbnail").children("a").children("img").attr("src", src);
			$(current_event).children(".info").children(".image").text(src);

			$("#image_picker_cover").hide();
			$("#image_picker").hide();
			
			current_event = null;
		}
	});


	$("#timeline .back").live("click", function() {
		timeline.zoomOut();
		timeline.draw();
	});

	$("#timeline .cluster img").live("click", function() {
		var parent = $(this).parents(".event");
		
		var min = $(parent).children(".info").children(".min_date").text();
		var max = $(parent).children(".info").children(".max_date").text();
		
		min = parseInt(min);
		max = parseInt(max);
		
		timeline.zoomIn(min, max);
		timeline.draw();
	});
	
	$("#timeline #image_picker .close").click(function() {
		$("#image_picker_cover").hide();
		$("#image_picker").hide();
	});
	
	$(".event .thumbnail .pick_image").live("click", function() {


		var source = $(this).parents(".event").children(".info").children(".source").text();
		var images = $(this).parents(".event").children(".info").children(".pictures").html();
		
		
		$("#image_picker ul").html(images);
		$("#image_picker .source").html(source);

		$(".pick_custom_image_text").val("");
		$("#image_picker_cover").show();
		$("#image_picker").show();
		
		current_event = $(this).parents(".event");
	});
	
	
	
	$(".event .close a").live("click", function() {
		$(this).parents(".event").remove();
		timeline.draw();
		hide_meta();
		return false;
	});
	
	
	function show_meta(url) {
		if(!timeline.show_meta) {
			return;
		}
		url = typeof(url) != 'undefined' ? url : "nope";
		if(url != "nope")
		{
			url = $.trim(url);
			$(".meta #fullLink").html('<b><a href="'+url+'">'+shortenUrl(url)+'</a></b>');
			$("#searchURL").attr("value",url);
			$('.meta #searchLink').click(function() { $('#searchURLForm').submit();			});
			//$(".meta #startLink").html('<a href="/trails/create?urls=' + escape(url) + '">Start new timeline from here</a>');
		}
		$(".meta").show();
		$(".meta_callout").show();
	}
	
	function hide_meta() {
		if(!timeline.show_meta) {
			return;
		}
		
		$(".meta").hide();
		$(".meta_callout").hide();		
	}
	
	$(".event").live("mouseenter", function() {
		


		
		
		//var parent = $(this).parents(".event");
		var parent = this;
		var left = $(parent).position().left;
		
		var event_width = $(parent).outerWidth();
		var timeline_width = $("#timeline").width();
		
		
		
		
		if(!$("#timeline").is(".noedit")) {
			$(parent).children(".thumbnail").children(".pick_image").show();			
		}
		
		
		if(!timeline.show_meta) {
			return;
		}
		
		
		var headline = "";
		var source = "";
		var url = "";
		
		if($(parent).is(".cluster")) {
			source = "Multiple Sources";
			headline = $(parent).children(".info").children(".count").text() + " articles";
			
		} else {
			headline = $(parent).children(".info").children(".headline").text();
			source = $(parent).children(".info").children(".source").text();
			url = $(parent).children(".info").children(".url").text();
		}
		
		$(".meta .headline").html(headline);
		$(".meta .source").html(source);

		$(".meta").css("top", 0);
		$(".meta").css("top", 0 - $(".meta").outerHeight() - 5);
		
		show_meta(url);
		
		if(left > (timeline_width) / 2) {
			$(".meta").css("left", left - ( $(".meta").outerWidth() - $(parent).outerWidth() ));

		} else {
			$(".meta").css("left", left);
		}
		
		var cal_left = left + (event_width/2.0) - ($(".meta_callout").width() / 2);
		$(".meta_callout").css("left", cal_left);
		
		if(meta_show_callback != null) {
			meta_show_callback.apply(this);
		}
		
	});
	

	
	$(".event").live("mouseleave", function() {
		
		//var parent = $(this).parents(".event");
		var parent = this;
		$(parent).children(".thumbnail").children(".pick_image").hide();
		
		
		hide_meta();
				
	});
	
	
	$(".event").live("mouseenter", function() {
		if($("#timeline.noedit").size() == 0) {
			$(this).children(".date").children(".close").show();
		}
	});
	
	
	$(".event").live("mouseleave", function() {
		if($("#timeline.noedit").size() == 0) {
			$(this).children(".date").children(".close").hide();
		}
	});
	
	
	$(".meta_callout").mouseenter(function(){
		show_meta();
	});
	
	$(".meta_callout").mouseleave(function(){
		hide_meta();
	});

	$(".meta").mouseenter(function(){
		show_meta();
	});
	
	$(".meta").mouseleave(function(){
		hide_meta();
	});


	
	/*
	$('#timeline .events').mousewheel(function(event , delta) {

		var left = $(".events").scrollLeft();
		delta = 0 - delta;
		
		left += delta * 15;
		$(".events").scrollLeft(left);
		return false;
		
	});
	*/
	
						
});

