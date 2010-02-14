require 'open-uri'
#require 'json'



class TrailsController < ApplicationController
  include TrailsHelper
  protect_from_forgery :except => :new

  
  def embed 
    @trail = Trail.find(params[:id])
    
    @articles = @trail.articles_json

    respond_to do |format|
      format.html { render :templte => false}
    end    
    
  end


  def show
    @trail = Trail.find(params[:id])

    @articles = @trail.articles_json

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @trail }
    end    
    
  end



  def new
    
    @articles = nil
    if params[:urls] then
      @articles = parse_urls(params[:urls])
    end
    
  end
  
  def create
    
    args = ActiveSupport::JSON.decode(params[:trail])
    links = args["links"]
    
    puts links
    
    @trail = Trail.new
    @trail.caption = args["title"]
    if current_user
		@trail.user_id = current_user
	end
	
    links.each do |link|
      
      date = nil
      
      begin
        date = Date.parse(link["date"])
      rescue Exception => the_error
        date = DateTime.new
      end
      
      article = Article.new(link)
      article.date = date
            
      @trail.articles << article
    end

	
	
    if @trail.save
      flash[:notice] = 'Timeline was successfully created.'
      #render :text => @trail.id     
	  session[:trails] << @trail
      redirect_to :controller => 'trails', :action => 'show', :id => @trail.id
    else
      flash[:error] = 'Timeline could not be created.'
      render :action => 'create'
    end
    
    
    
  end
  
  def edit
    
  end
  
  def update
    
  end
  
  def slideshow
    render :layout => "slideshow"
  end

  def process_urls
    @data = parse_urls(params[:urls])
    render :json => @data   
    
  end

end
