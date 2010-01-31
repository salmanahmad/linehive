// BEGIN TIMELINE NAMESPACE

var timeline = {
	duration:250,
	init: function(datas) {
		console.log("init");
		
		for(i in datas) {
			var data = datas[i];			
			this.add(data["article"]);
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
			</div>                                         		\
			<div class="tick">                             		\
&nbsp;					                    					\
			</div>                                         		\
			<div class="date">                             		\
				<div class="close">[<a href="#">x</a>]</div>	\
				$format				                            \
			</div>                                         		\
		</div>                                           		\
		';
		
		var date = new Date(Date.parse(e["date"]));
		var date_format = date.toDateString();
		
		/*
		template = template.replace(/\$headline/g, e.headline);
		template = template.replace(/\$url/g, e.url);
		template = template.replace(/\$source/g, e.source);
		template = template.replace(/\$image/g, e.image_url);
		template = template.replace(/\$date/g, e.date);
		template = template.replace(/\$format/g, date_format);						
		*/
		                           
		template = template.replace(/\$headline/g, e["headline"]);
		template = template.replace(/\$url/g, e["url"]);
		template = template.replace(/\$source/g, e["source"]);
		template = template.replace(/\$image/g, e["image_url"]);
		template = template.replace(/\$date/g, e["date"]);
		template = template.replace(/\$format/g, date_format);
		
		$("#timeline").append(template);
				                                                 						                                                 
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
			
			$(min_event).children(".insert").remove();
			$(max_event).children(".insert").remove();
			
			
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
			
			$(min_event).css("left", middle);
			$(max_event).css("left", middle);							

			$(min_event).animate({ left: min_left }, this.duration);
			$(max_event).animate({ left: max_left }, this.duration);

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
			

			$(".event:eq("+ min_index + ")").animate({ left: 0}, this.duration);

			//$(".event:eq("+ max_index + ")").css("left", "auto");
			//$(".event:eq("+ max_index + ")").css("right", middle);
			//$(".event:eq("+ max_index + ")").animate({ right: 0}, this.duration);
			$(".event:eq("+ max_index + ")").animate({ left: end}, this.duration);


			
			
			$(".event").each(function(index, event) {
				if(index != min_index && index != max_index) {
					var date_text = $(event).children(".info").children(".date").text();
					var date = new Date(Date.parse(date_text));
					
					var date_offset = date.getTime() - min_date.getTime();
					var date_percent = date_offset / date_range;
					
					var left = ($("#timeline").outerWidth() * date_percent);
					left -= $(event).outerWidth() / 2;
					
					$(event).animate({ left: left }, this.duration);
					
				}
			});	
		}                                                
	}                                                                                
}                                                    

// END TIMELINE NAMESPACE


$(function() {
	
	$(".event .close a").live("click", function() {
		$(this).parents(".event").remove();
		timeline.draw();
		return false;
	});
	
	$(".event .thumbnail img").live("mouseenter", function() {
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

		
		if(left > (timeline_width) / 2) {
			$(".meta").css("left", left - ( $(".meta").outerWidth() - $(parent).outerWidth() ));

		} else {
			$(".meta").css("left", left);									
		}
		
		var cal_left = left + (event_width/2.0) - ($(".meta_callout").width() / 2);
		$(".meta_callout").css("left", cal_left);
		
		
	});
	
	$(".event .thumbnail img").live("mouseleave", function() {
		$(".meta").hide();
		$(".meta_callout").hide();										
	});
						
});

