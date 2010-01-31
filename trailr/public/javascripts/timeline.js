// BEGIN TIMELINE NAMESPACE

var timeline = {
	duration:250,
	init: function() {
		console.log("init");
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
				<a href="$url">									\
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

		var date = new Date(Date.parse(e.date));
		var date_format = date.toDateString();
		
		template = template.replace(/\$headline/g, e.headline);
		template = template.replace(/\$url/g, e.url);
		template = template.replace(/\$source/g, e.source);
		template = template.replace(/\$image/g, e.image);
		template = template.replace(/\$date/g, e.date);
		template = template.replace(/\$format/g, date_format);						
		                      
		                           
		$("#timeline").append(template);
		                                                 						                                                 
		//this.draw();                                     
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
					
	
	


	// START TEMP
	
	$("#add1").click(function() {
		timeline.add({
		headline: "YouTube: Mad Tv - IPad",
		url: "http://www.youtube.com/watch?v=lsjU0K8QPhs",
		source: "youtube.com",
		image: "http://i4.ytimg.com/vi/WK2drIylnDw/default.jpg",
		date: "April 15, 2006 16:05:00"
		});

		timeline.draw();
		
		$(this).attr('disabled', 'disabled');

	});
	
	$("#add2").click(function() {
		timeline.add({
		headline: "3G IPhone Due on June 9, Analysts Say",
		url: "http://abcnews.go.com/Technology/PCWorld/story?id=4719951",
		source: "abcnews.go..com",
		image: "http://www.mapds.com.au/newsletters/0807/iphone_home.gif",
		date: "May 24, 2008 16:05:00"
		});
		
		timeline.draw();
		
		$(this).attr('disabled', 'disabled');
		
		
	});				
	
	$("#add3").click(function() {
		timeline.add({
		headline: "The Kindle.  From Amazon.",
		url: "http://www.amazon.com/dp/B0015T963C",
		source: "amazon.com",
		image: "http://www.picpocketbooks.com/wp-content/uploads/2009/11/kindle.jpg",
		date: "November 19, 2007 16:05:00"
		});
		
		timeline.draw();
		
		$(this).attr('disabled', 'disabled');
		
		
	});
	
	$("#add4").click(function() {
		timeline.add({
		headline: "Apple iPad vs. Amazon Kindle chart",
		url: "http://news.cnet.com/8301-17938_105-10443186-1.html",
		source: "cnet.com",
		image: "http://media.nj.com/ledgerupdates_impact/photo/apple-ipad-tablet-steve-jobsjpg-fd9049ca2d6b3208_large.jpg",
		date: "January 27, 2010 14:05:00"
		});
		
		timeline.draw();
		
		$(this).attr('disabled', 'disabled');
		
		
	});								
	
	function sample() {
		timeline.add({
		headline: "YouTube: Mad Tv - IPad",
		url: "http://www.youtube.com/watch?v=lsjU0K8QPhs",
		source: "youtube.com",
		image: "http://i4.ytimg.com/vi/WK2drIylnDw/default.jpg",
		date: "April 15, 2006 16:05:00"
		});

		timeline.add({
		headline: "3G IPhone Due on June 9, Analysts Say",
		url: "http://abcnews.go.com/Technology/PCWorld/story?id=4719951",
		source: "abcnews.go..com",
		image: "http://www.mapds.com.au/newsletters/0807/iphone_home.gif",
		date: "May 24, 2008 16:05:00"
		});



		timeline.add({
		headline: "The Kindle.  From Amazon.",
		url: "http://www.amazon.com/dp/B0015T963C",
		source: "amazon.com",
		image: "http://www.picpocketbooks.com/wp-content/uploads/2009/11/kindle.jpg",
		date: "November 19, 2007 16:05:00"
		});



		timeline.add({
		headline: "Apple iPad vs. Amazon Kindle chart",
		url: "http://news.cnet.com/8301-17938_105-10443186-1.html",
		source: "cnet.com",
		image: "http://media.nj.com/ledgerupdates_impact/photo/apple-ipad-tablet-steve-jobsjpg-fd9049ca2d6b3208_large.jpg",
		date: "January 27, 2010 14:05:00"
		});
		
		timeline.draw();
		
	}
	
	
	function sample2() {
		timeline.add({
	   headline: "'Avatar's' True Cost -- and Consequences",
	   url: "http://www.thewrap.com/article/true-cost-and-consequences-avatar-11206?page=1",
	   source: "www.thewrap.com",
	   image: "http://www.thewrap.com/files/imagecache/article_full/news_article/avittar.jpg",
	   date: "December 03 2009 10:00:00"
   });

		timeline.add({
	   headline: "Family Filmgoer",
	   url: "http://www.boston.com/lifestyle/family/articles/2009/10/29/family_filmgoer/?page=3",
	   source: "www.boston.com",
	   image: "http://cache.boston.com/universal/site_graphics/bcom_small.gif",
	   date: "December 24 2009 10:00:00"
   });

	timeline.add({
		   headline: "James Cameron's 'Avatar' Film to Feature Vocals From Singer Lisbeth Scott",
		   url: "http://newsblaze.com/story/2009102916560100002.pnw/topstory.html",
		   source: "newsblaze.com",
		   image: "http://newsblaze.com/images/newsblazehead_alt.gif",
		   date: "October 29, 2009 16:05:00"
	})


		timeline.add({
	   headline: "Q&A with James Cameron",
	   url: "http://www.time.com/time/arts/article/0,8599,1576622,00.html#ixzz0a69HUhNB",
	   source: "www.time.com",
	   image: "http://img.timeinc.net/time/daily/2007/0701/cameron_0110.jpg",
	   date: "December 11, 2009 16:05:00"
		});


		timeline.draw();
		
	}
	
	$("#add").click(sample);

	timeline.init();
	
	
	
	// END TEMP
	
});

