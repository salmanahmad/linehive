// BEGIN TIMELINE NAMESPACE

var timeline = {
	months: [],
	duration:250,
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
	add: function(e) {
		
		console.log("add");
		console.log(e);
		
		
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

//			</div>                                         		\
//		</div>                                           		\
//		';
		
		template += '</div></div>'
		
		console.log(e["date"]);
		
		
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
		                                                 
		// How or hide the empty tag which displays an image to the user indicating there
		// are no events currently available to be visualized                                                 
		if($(".event").size() == 0) {                    
			$(".empty").show();                            
		} else {                                         
			$(".empty").hide();                            
		}                                                
		
		var count = $(".event").size();
		if(count == 0) {
			
		} else if(count == 1) {
			
			var event = $(".event:first");
			
			$(event).children(".insert").remove();
			
			
			var min_date = $(event).children(".info").children(".date").text();
			min_date = Date.parse(min_date);
			console.log(min_date);
			
			
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
			
			var date_range = 0;
			
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
			
			
			date_range = max_date.getTime() - min_date.getTime();
			
			
			var events = {}
			

			$(".event:eq("+ min_index + ")").animate({ left: 0}, this.duration);

			//$(".event:eq("+ max_index + ")").css("left", "auto");
			//$(".event:eq("+ max_index + ")").css("right", middle);
			//$(".event:eq("+ max_index + ")").animate({ right: 0}, this.duration);
			$(".event:eq("+ max_index + ")").animate({ left: end}, this.duration);

			events[0] = $(".event:eq("+ min_index + ")");
			events[end] = $(".event:eq("+ max_index + ")");
			
			
			$(".event").each(function(index, event) {
				if(index != min_index && index != max_index) {
					var date_text = $(event).children(".info").children(".date").text();
					var date = new Date(Date.parse(date_text));
					
					var date_offset = date.getTime() - min_date.getTime();
					var date_percent = date_offset / date_range;
					
					
					// TODO: Validate this:
					//var left = ($("#timeline").outerWidth() * date_percent);
					//left -= $(event).outerWidth() / 2;
					
					
					var left = (($("#timeline").outerWidth() - $(event).outerWidth())  * date_percent);
				

				
					
					
					
					$(event).animate({ left: left }, this.duration);
					
				}
			});	
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

		var headline = $(parent).children(".info").children(".headline").text();
		var source = $(parent).children(".info").children(".source").text();


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

