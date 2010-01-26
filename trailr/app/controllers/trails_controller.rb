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
    
    @data = []
    
    for url in urls do
      begin

        open(url) do |f|

          date_regex = Regexp.new("(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])");
          meta_regex = Regexp.new("<meta\s+name=\"description\"\s+content=\"(.*?)\".*?>", Regexp::IGNORECASE)
          p_regex = Regexp.new("<p[^>]*>(.*?)</p>", Regexp::IGNORECASE);
          title_regex = Regexp.new("<title[^>]*>(.*?)</title>", Regexp::IGNORECASE);
          img_regex = Regexp.new("<img[^>]*/?>", Regexp::IGNORECASE);

          html = f.read
                    
          uri = URI.parse(url)
          host = URI.parse(url).host
          dirname = File.dirname(URI.parse(url).path)

          title = title_regex.match(html)
          date = title_regex.match(html)
          desc = meta_regex.match(html)
          
          if(title) then title = title[1] else title = nil end 
          if(date) then date = date[1] else date = nil end 
          
          if(desc) then
            desc = desc[1] 
            desc.gsub!(/<\/?[^>]*>/, "")
            desc.chomp!
            
            if desc != ""
              desc = "#{desc}"
            end
            
          else 
            desc = p_regex.match(html);
            if(desc) then
              desc = desc[1]
            else
              desc = nil 
            end
          end
          

          #threshold = 2000
          threshold = 10000
          urls = []
          html.scan(img_regex) do |match|
            
            width_regex = Regexp.new("width=\"(.*?)\"")
            width_regex = Regexp.new(/(width)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/)
            height_regex = Regexp.new("height=\"(.*?)\"")
            height_regex = Regexp.new(/(width)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/)
            src_regex = Regexp.new("src=\"(.*?)\"")

            width = width_regex.match(match)      
            height = height_regex.match(match)
            src = src_regex.match(match)

            if(width) then width = width[2].to_i else width = 0 end
            if(height) then height = height[2].to_i else height = 0 end
            if(src) then src = src[1] else src = nil end

            if(src && height * width >= threshold) 

              if(src.match(/^http:/))
                src = src
              elsif(src.match(/^\//))
                src = "#{uri.scheme}://#{host}#{src}"
              else
                src = "#{uri.scheme}://#{host}#{dirname}/#{src}"
              end
              
              urls << src


            end
          end
          
          
          hash = {
            :url => url,
            :header => title,

            #:date => Time.now.rfc2822,
            :date => Time.now.strftime("%m/%d/%Y"),
            
            :source => host,

            :notes => desc,
            :urls => urls
          }
          
 
         @data << hash


        end

      rescue Exception => the_error

        puts "Exception - Need more sophisticated error reproting later... #{the_error.class}"
      end
    
    end
        
    render :template => false
    
  end

end
