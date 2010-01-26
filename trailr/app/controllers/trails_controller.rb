require 'open-uri'
require 'json'



class TrailsController < ApplicationController

  protect_from_forgery :except => :new

  def show
    
  end

  def new
    
  end
  
  def create
    
  end
  
  def edit
    
  end
  
  def update
    
  end
  
  def slideshow
    render :layout => "slideshow"
  end

  def process_urls

    http_regex = /^http/
    url_regex = /(^$)|(^(http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(([0-9]{1,5})?\/.*)?$)/ix
    
    temp_urls = []
    urls = params[:urls].split(/\s+/);
    
    for url in urls do
      if(url.match(url_regex)) then
        if(!http_regex.match(url))
          url = "http://#{url}"
        end
        temp_urls << url
      end        
    end
    
    urls = temp_urls
    puts urls;
    
    @data = []
    
    
    for url in urls do
      begin
        
        puts url
        
        open(url) do |f|


          date_regex = Regexp.new("(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])");
          meta_regex = Regexp.new("<meta\s+name=\"description\"\s+content=\"(.*?)\".*?>", Regexp::IGNORECASE)
          p_regex = Regexp.new("<p[^>]*>(.*?)</p>", Regexp::IGNORECASE);
          title_regex = Regexp.new("<title[^>]*>(.*?)</title>", Regexp::IGNORECASE);

          html = f.read
          
          
          
          host = URI.parse(url).host

          title = title_regex.match(html)
          date = title_regex.match(html)
          desc = meta_regex.match(html)
          



          if(title) then title = title[1] else title = nil end 
          if(date) then date = date[1] else date = nil end 
          
          if(desc) then
            desc = desc[1] 
            desc.gsub!(/<\/?[^>]*>/, "")
          else 
            desc = p_regex.match(html);
            if(desc) then
              desc = desc[1]
            else
              desc = nil 
            end
          end
          
          hash = {
            :url => url,
            :header => title,

            #:date => Time.now.rfc2822,
            :date => Time.now.strftime("%m/%d/%Y"),
            
            :source => host,

            :notes => "\"#{desc}\""
          }
          
 
         @data << hash


        end

      rescue Exception => the_error

        puts "Exception - Need more sophisticated error reproting later... #{the_error.class}"
      end
    
    end
    
    
    
=begin    
    hash = {
      :url => "http://www.google.com",
      :header => "Some header information",
      
      :date => Time.now.rfc2822,
      :source => "cnn.com",
      
      :notes => "\"This is a sample paragraph that is included\""
    }
=end    
    
    
    render :template => false
    
  end

end
