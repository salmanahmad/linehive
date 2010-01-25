require 'json'



class TrailsController < ApplicationController

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

    url_regex = /(^$)|(^(http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(([0-9]{1,5})?\/.*)?$)/ix
    
    temp_urls = []
    urls = params[:urls].split(/\s+/);
    
    for url in urls do
      if(url.match(url_regex)) then
        temp_urls << url
      end        
    end
    
    urls = temp_urls
    puts urls;
    
    
    
    
    
    
    data = []
    
    hash = {
      :url => "http://www.google.com",
      :header => "Some header information",
      
      :date => Time.now.rfc2822,
      :source => "cnn.com",
      
      :notes => "\"This is a sample paragraph that is included\""
    }
    
    
    

    render :partial => "article", :locals => hash
    
  end

end
