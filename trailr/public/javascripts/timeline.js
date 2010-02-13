// BEGIN TIMELINE NAMESPACE



var timeline = {
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
	add: function(e) {
		
		console.log("add");
		
		
		var template = '										\
		<div class="event">										\
			<div class="insert"></div>							\
			<div class="info">									\
				<div class="pictures">							\
					$pictures									\
				</div>											\
				<div class="headline">                       	\
					$headline					                \
				</div>                                       	\
				<div class="url">                            	\
					$url							            \
				</div>                                       	\
				<div class="source">                         	\
					$source                                    	\
				</div>                                       	\
				<div class="image">                          	\
					$image	                                  	\
				</div>                                       	\
				<div class="date">                           	\
					$date						                \
				</div>                                       	\
			</div>                                         		\
			<div class="thumbnail">                        		\
				<a href="$url" onclick="window.open(\'$url\'); return false;" target="_blank">									\
				<img src="$image">					            \
				</a>											\
				<span class="pick_image">Change Image</span>		\
			</div>                                         		\
			<div class="tick">                             		\
&nbsp;					                    					\
			</div>                                         		\
			<div class="date">                             		\
				<div class="close">[<a href="#">x</a>]</div>	';


		if($("#timeline.noedit").size() == 0) {
			template += '<input type="text" value="$format" class="date_edit" />';
		} else {
			template += '$format';
		}

		
		template += '</div></div>';
		
		
		var date = new Date(Date.parse(e["date"]));
		
		if(date == "Invalid Date") {
			date = new Date();
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);									
		}
		
		
		
		var m = this.months
		var date_format = date.toDateString();
		date_format = ""  + m[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
		
		var pictures_data = "";
		var pictures = e["pictures"];
		for(i in pictures) {
			pictures_data += '<li><img src="' + pictures[i] + '" /></li>';
		}
		
		
		/*
		template = template.replace(/\$headline/g, e.headline);
		template = template.replace(/\$url/g, e.url);
		template = template.replace(/\$source/g, e.source);
		template = template.replace(/\$image/g, e.image_url);
		template = template.replace(/\$date/g, e.date);
		template = template.replace(/\$format/g, date_format);						
		*/
		
		var headline = e["headline"];
		
		if (headline == null) {
			headline = "Title Not Available";
		}
		
		template = template.replace(/\$headline/g, headline);
		template = template.replace(/\$url/g, e["url"]);
		template = template.replace(/\$source/g, e["source"]);
		template = template.replace(/\$image/g, e["image_url"]);
		//template = template.replace(/\$date/g, e["date"]);
		template = template.replace(/\$date/g, date.toUTCString());
		template = template.replace(/\$format/g, date_format);
		template = template.replace(/\$pictures/g, pictures_data);

		
		$("#timeline .events").append(template);
		
		if($("#timeline.noedit").size() == 0) {
		
			//$(".date_edit").datepicker({dateFormat: 'MM d, yy', 
			$(".date_edit").datepicker({dateFormat: 'M d, yy', 			
										changeMonth:true, 
										changeYear:true,
										showButtonPanel:true,
										currentText:'Show Today',
										onClose:this.updateDate,
										closeText:'Cancel'});
		} else {
			$(".date_edit").attr("disabled", true);
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


		/*
		// remove any previous clusters...
		$(".dummy").remove();
		$(".cluster").remove();
		$(".event").show();
                            

		if(this.zoom_stack.length == 0) {
			$("#timeline .back").hide();
		} else {
			$("#timeline .back").show();
		}
		*/
		
     
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
			
			if(event_total_width < timeline_width ) {
				start_left = (timeline_width/2) - (event_total_width/2);
			}
			
			var events = [];
			$(".event").each(function(index, element) {
				events.push($(this));
			});

			events.sort(function(a, b) {

				var date1_text = $(a).children(".info").children(".date").text();
				var date2_text = $(b).children(".info").children(".date").text();			

				var date1 = new Date(Date.parse(date1_text));
				var date2 = new Date(Date.parse(date2_text));

				return date1 - date2;

			});
			
			var left = start_left;
			for(var i in events) {
				var event = events[i];
				
				$(event).animate({ left: left }, this.duration, "easeOutBounce");
				
				left += event_width;
			}
				

		}
		
		/*
		if(count == 0) {
			
		} else if(count == 1) {
			
			var event = $(".event:first");
			
			$(event).children(".insert").remove();
			
			
			var min_date = $(event).children(".info").children(".date").text();
			min_date = Date.parse(min_date);
			
			
			var left = ($("#timeline").outerWidth() / 2);
			left -= $(event).outerWidth() / 2;
			
			$(event).animate({ left: left }, this.duration);

		} else if(count == 2) {
			
			// We guess the earlier and later events
			var min_event = $(".event:first");
			var max_event = $(".event:last");
			
			var min_date = $(min_event).children(".info").children(".date").text();
			var max_date = $(max_event).children(".info").children(".date").text();
			
			min_date = Date.parse(min_date);
			max_date = Date.parse(max_date);
			
			// If the min_date is greater than max, then we switch							
			if(min_date > max_date) {
				var temp = max_event;

				max_event = min_event;
				min_event = temp;
			}
			
			
			// Now, min_event should appear to the left of max event...
			
			var min_left = ($("#timeline").outerWidth() / 4);
			min_left -= $(min_event).outerWidth() / 2;
			
			var max_left = ($("#timeline").outerWidth() * (3/4));
			max_left -= $(max_event).outerWidth() / 2;
			
			var middle = ($("#timeline").outerWidth() / 2.0) - ($(".event:first").outerWidth() /2);
			
			if($(min_event).children(".insert").size() != 0) {
				$(min_event).css("left", middle);			
			}

			if($(max_event).children(".insert").size() != 0) {
				$(max_event).css("left", middle);			
			}


			$(min_event).animate({ left: min_left }, this.duration);
			$(max_event).animate({ left: max_left }, this.duration);

			
			$(min_event).children(".insert").remove();
			$(max_event).children(".insert").remove();
			

		} else {
			
			// Now comes the hard part...
			
			var scale = 0;
			
			max_index = 0;
			max_date = null;
			
			min_index = 0;
			min_date = null;
			
			var middle = ($("#timeline").outerWidth() / 2.0) - ($(".event:first").outerWidth() /2);
			var end = $("#timeline").outerWidth() - $(".event:first").outerWidth();
			
			$(".event").each(function(index, event) {

				if($(event).children(".insert").size() != 0) {
					$(event).css("left", middle);									
					$(event).children(".insert").remove();
				}

				
				var date_text = $(event).children(".info").children(".date").text();
				var date = new Date(Date.parse(date_text));
								
				
				if(max_date == null || (date > max_date)) {
					max_date = date;
					max_index = index;
				}

				if(min_date == null || (date < min_date)) {
					min_date = date;
					min_index = index;
				}
				
			});
			
			
			scale = timeline.computeScale();
			if(scale == null) {
				scale = max_date.getTime() - min_date.getTime();
			}

			
			
			var events = {};
			
			
			// TODO: Abstract This!
			var event_width = $(".event:first").outerWidth();

			$(".event:eq("+ min_index + ")").animate({ left: 0}, this.duration);

			//$(".event:eq("+ max_index + ")").css("left", "auto");
			//$(".event:eq("+ max_index + ")").css("right", middle);
			//$(".event:eq("+ max_index + ")").animate({ right: 0}, this.duration);
			//$(".event:eq("+ max_index + ")").animate({ left: end}, this.duration);

						
			events[0] = [min_index];
			//events[end] = [max_index];
			
			
			var max_left = (max_date.getTime() - min_date.getTime()) / scale ;
			max_left *= ($("#timeline").outerWidth() - event_width);
			
			
			$(".event").each(function(index, event) {
				//if(index != min_index && index != max_index) {
				if(index != min_index) {	
					var date_text = $(event).children(".info").children(".date").text();
					var date = new Date(Date.parse(date_text));
					
					var date_offset = date.getTime() - min_date.getTime();
					var date_percent = date_offset / scale;
					
					var left = (($("#timeline").outerWidth() - $(event).outerWidth())  * date_percent);
					
					if(timeline.isUnitScale()) {
						var found_slot = false;
						
						var search_right = true;
						if(left == max_left) {
							search_right = false
						} else {
							search_right = true
						}
						
						while(!found_slot) {
														
							if(!events[left]) {
								found_slot = true;
								events[left] = [];
								events[left].push(index);
							} else {
								
								if(search_right) {
									left += event_width;
								} else {
									left -= event_width;
								}

							}
						}
						
						
					} else {
						if(!events[left]) {
							events[left] = []
						}						
						
						events[left].push(index);
					}
					
					$(event).animate({ left: left }, this.duration);
				}
				
			});	
			

			if(this.use_clustering) {
		
				// Iteratively cluster the clusters...soooo confusing. Good luck understanding the code...
				var change = true;
				while(change) {
					change = false;
					for(var e1 in events) {
					
					
						var should_break = false;
										
						for(var e2 in events) {

							if(e1 != e2) {
								var diff = Math.abs(e1 - e2);
								var mid = (parseFloat(e1) + parseFloat(e2)) / 2.0;
							
								// TODO: CLusters are the same width as the events
								if(diff < (event_width * timeline.overlap)) {
								
									change = true;
									should_break = true;
								
									var array = events[e1].concat(events[e2]);

									delete events[e1];
									delete events[e2];
																
								
									if(!events[mid]) {
										events[mid] = array;
									} else {
										events[mid] = events[mid].concat(array);
									}
								

								
								
									break;
								
								
								}
							}
						}
					
						// FUUUUUUUUUUUUUUUUUUUUCK
						if(should_break) {
							break;
						}
					
					
					}
				}
						
				console.log(new Date(min_date));
			
				for(var e in events) {
					if(events[e].length > 1) {
					
						var date_range = "Date Range";
						var min_d = null;
						var max_d = null;
						var count = 0;
					
						for(var i in events[e]) {
						
						
							var event = $(".event:eq(" + events[e][i] + ")");
							$(event).hide();
						
							var date_text = $(event).children(".info").children(".date").text();
							var date = new Date(Date.parse(date_text));


							if(max_d == null || (date > max_d)) {
								max_d = date;
							}

							if(min_d == null || (date < min_d)) {
								min_d = date;
							}
						
						
							count++;
						}
					
					
						if(min_d.getDate() == max_d.getDate() &&
							min_d.getMonth() == max_d.getMonth() &&
							min_d.getFullYear() == max_d.getFullYear()) {
							var m = this.months
							date_range = ""  + m[min_d.getMonth()] + " " + min_d.getDate() + ", " + min_d.getFullYear();							
						} else {
							var m = this.months
							date_range = ""  + m[min_d.getMonth()] + " " + min_d.getDate() + ", " + min_d.getFullYear();
							date_range += " - " + m[max_d.getMonth()] + " " + max_d.getDate() + ", " + max_d.getFullYear();
						}

					
					
						var template = '<div class="event cluster"> \
							<div class="info">									\
								<div class="min_date">' + min_d.getTime() + '</div>	\
								<div class="max_date">'+ max_d.getTime() + '</div>		\
								<div class="count">' + count +'</div>			\
							</div>												\
							<div class="thumbnail">                        		\
								<img width="30" src="/images/cluster.png">		\
							</div>                                         		\
							<div class="tick">                             		\
								&nbsp;			              					\
							</div>                                         		\
							<div class="date">                             		\
								' + date_range + '								\
							</div>												\
						</div>';
										
						$(".events").append(template);
					
					
						// TODO: I need to fix this. I can only intelligently scroll if I do NOT use an animation...
						$(".cluster:last").css("left", middle);	
						$(".cluster:last").animate({ left: e }, this.duration);
						//$(".cluster:last").css("left", e);
					} 
					
				}
			
				// to solve the scrolling problem
				var dummy = '<div class="dummy" style="position:absolute;left:'+ max_left +'px;"></div>';
				$(".events").append(dummy);
			
				var scroll_offset = (new Date(this.min_date)).getTime() - min_date.getTime();
				var scroll_percent = scroll_offset / scale;
				var scroll_left = (($("#timeline").outerWidth() - $(".event:first").outerWidth())  * scroll_percent);
				
				$(".events").scrollLeft(scroll_left);				
			
			
			}
			
			
			

		}*/
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
		return false;
	});
	
	
	$(".event .thumbnail").live("mouseenter", function() {
		
		
		var parent = $(this).parents(".event");
		var left = $(parent).position().left;
		
		var event_width = $(parent).outerWidth();
		var timeline_width = $("#timeline").width();
		
		var headline = "";
		var source = "";
		
		if($(parent).is(".cluster")) {
			source = "Multiple Sources";
			headline = $(parent).children(".info").children(".count").text() + " articles";
			
		} else {
			headline = $(parent).children(".info").children(".headline").text();
			source = $(parent).children(".info").children(".source").text();			
		}
		



		$(".meta .headline").html(headline);
		$(".meta .source").html(source);


		$(".meta").css("top", 0);
		$(".meta").css("top", 0 - $(".meta").outerHeight() - 5);
		
				

		$(".meta").show();
		$(".meta_callout").show();
		
		
		
		if(!$("#timeline").is(".noedit")) {
			$(parent).children(".thumbnail").children(".pick_image").show();			
		}
		
		
		

		
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
	
	$(".event .thumbnail").live("mouseleave", function() {
		$(".meta").hide();
		$(".meta_callout").hide();		
		
		var parent = $(this).parents(".event");
		$(parent).children(".thumbnail").children(".pick_image").hide();
				
	});
						
});

