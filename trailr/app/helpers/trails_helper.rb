require 'open-uri'


module TrailsHelper

  def parse_urls(urls_args)
    
    http_regex = /^http/
    url_regex = /(^$)|(^(http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(([0-9]{1,5})?\/.*)?$)/ix
    
    temp_urls = []
    urls = urls_args.split(/\s+/);
    
    for url in urls do
      if(url.match(url_regex)) then
        if(!http_regex.match(url))
          url = "http://#{url}"
        end
        temp_urls << url
      end        
    end
    
    urls = temp_urls
    
    data = []
    
    for url in urls do
      data << parse_url(url)
    end
    
    # For future reference...
    #items = ActiveSupport::JSON.decode("{
    #  titles: ['harry potter', 'star wars', 'chhese...']
    #}");
    
    

    return data
    #render :json => @data.to_json
    #render :template => false
    
    
  end

  def parse_url(url)
    begin

      open(url) do |f|

        date_regex = Regexp.new("(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])");
        date_regex = Regexp.new(".*(((J(anuary|uly)|Ma(rch|y)|August|(Octo|Decem)ber)|(Jan|July|Mar|Aug|Oct|Dec).?)\s+(0?[1-9]|[12][0-9]|3[01]),?\s+[1-9][0-9]{3}|((April|June|(Sept|Nov)ember)|(Apr|Jun|Sep|Nov).?)\s+(0?[1-9]|[12][0-9]|30),?\s+[1-9][0-9]{3}|(February|Feb.?)\s+(0?[1-9]|1[0-9]|2[0-8]),?\s+[1-9][0-9]{3}|(February|Feb.)\s+29,?\s+((0[48]|[2468][048]|[13579][26])00|[0-9]{2}(0[48]|[2468][048]|[13579][26]))).*", Regexp::IGNORECASE | Regexp::MULTILINE);

        meta_regex = Regexp.new("<meta\s+name=\"description\"\s+content=\"(.*?)\".*?>", Regexp::IGNORECASE)
        p_regex = Regexp.new("<p[^>]*>(.*?)</p>", Regexp::IGNORECASE);
        title_regex = Regexp.new("<title[^>]*>(.*?)</title>", Regexp::IGNORECASE);
        img_regex = Regexp.new("<img[^>]*/?>", Regexp::IGNORECASE);

        html = f.read

        uri = URI.parse(url)
        host = URI.parse(url).host
        dirname = File.dirname(URI.parse(url).path)

        title = title_regex.match(html)
        date = date_regex.match(html)
        desc = meta_regex.match(html)


        if(title) then title = title[1] else title = nil end 
        if(date) then date = date[1] else date = nil end 

        puts date


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
        urls_hash = {}
        largest_url = nil
        largest_size = 0
        
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
          
          if(src) then
          
            if(src.match(/^http:/))
              src = src
            elsif(src.match(/^\//))
              src = "#{uri.scheme}://#{host}#{src}"
            else
              src = "#{uri.scheme}://#{host}#{dirname}/#{src}"
            end
            
            
            # I am not sure about this...but whatever
            #if File.extname(src).match(/gif\s*$/i)
            #  next
            #end
            
            
            if(urls_hash[src] == nil)
              urls << src
            end
            
            urls_hash[src] = true

            #if(src && height * width >= threshold) 
            if(src && height * width >= largest_size) 
            
              largest_size = height * width
              largest_url = src

              #skipping my awesome logic for now...sadly...I am not only using it to find the largest image...
              #urls << src

            end
          
          end
        end


=begin          
        hash = {
          :url => url,
          :header => title,

          #:date => Time.now.rfc2822,
          :date => Time.now.strftime("%m/%d/%Y"),

          :source => host,

          :notes => desc,
          :urls => urls
        }
=end          

       hash = {
         :url => url,
         :headline => title,
         :source => host,
         #:image_url => urls[0],
         :image_url => largest_url,
         :date => date,
         :pictures => urls
       }

       return hash

      end

    rescue Exception => the_error

      puts "Exception - Need more sophisticated error reproting later... #{the_error.class}\n #{the_error.backtrace}"
      return nil
    end


    
  end
  
  
end
