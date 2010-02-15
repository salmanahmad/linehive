require 'open-uri'
#require 'json'



class TrailsController < ApplicationController
  include TrailsHelper
  protect_from_forgery :except => :new

  
  def embed 
    @trail = Trail.find(params[:id])
    
    @articles = @trail.articles_json

    respond_to do |format|
      format.html { render :template => false}
    end    
    
  end


  def show
    @trail = Trail.find(params[:id])
    @articles = @trail.articles_json


    update_viewcount(params[:id])



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
	
    @articles = [];
    
    has_errors = false
    if links.length < 4 || links.length > 7 then
    
      @trail.valid?
      @trail.errors.add("articles", "Timelines must contain between 4 and 7 articles.")
      
      has_errors = true;
      
    end

    links.each do |link|
      @articles << link.dup

      date = nil
      begin
        date = Date.parse(link["date"])
      rescue Exception => the_error
        date = DateTime.new
      end

      link.delete("pictures")

      article = Article.new(link)
      article.date = date

      @trail.articles << article
    end
      

	if !has_errors && @trail.save
      flash[:notice] = 'Trail was successfully created.'
#session[:trails] << @trail
      redirect_to :controller => 'trails', :action => 'show', :id => @trail.id
    else
      flash[:error] = 'Trail could not be created.'
      render :action => 'new'
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


private 

  
  def update_viewcount(id)
    views = session[:views]
    
    if views == nil
      session[:views] = {}
      views = session[:views]
    end
    
    if(!views.include?(id))
      @trail.increment! :viewcount
      session[:views][id] = true
    end
    
  end
  


end
