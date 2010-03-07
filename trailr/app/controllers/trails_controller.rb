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
    
    if(@trail.draft) then
      redirect_to :controller => "home", :action => "index"
      return;
    end
    
    @articles = @trail.articles_json
    

    update_viewcount(params[:id])



    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @trail }
    end    
    
  end



  def create_draft
    args = ActiveSupport::JSON.decode(params[:trail])

    if(!current_user)
      redirect_to :controller => "trails", :action => "new"
      return
    end
    
    
    if(args == nil || args == "")
      redirect_to :controller => "trails", :action => "new"
      return
    end
    
    @links = args["links"]
        
    @trail = Trail.new
    @trail.caption = args["title"]

    if current_user
		  @trail.user_id = current_user
	  end

    construct_trail
    @trail.draft = true
    
    if @trail.save(false)
      flash[:notice] = 'Draft saved successfully. You can access it from your account page.'
      redirect_to :controller => "trails", :action => "draft", :id => @trail.id
    else
      @show_notifications = false
      flash[:error] = 'Error: Draft could not be created.'
      render :action => 'new'
    end
    
  end


  # TODO: Refactor this...
  def draft
      edit
  end
  
  def save_draft
    
    @trail = Trail.find(params[:id])
    
    if(@trail.user && @trail.user.id != current_user || @trail.user.nil?)
      redirect_to :action => "show", :id => @trail.id
      return
    end
    
    args = ActiveSupport::JSON.decode(params[:trail])
    @links = args["links"]
    
    # TODO: IMPROVE PERFORMANCE! EVEN WHEN THE SAVE FAILS, THIS GETS RE-CREATED
    @trail.caption = args["title"]
    @trail.articles.clear
    
    construct_trail

	  if @trail.save(false)
      # clear errors for the _form.html.erb partial
	    @trail.errors.clear
      flash[:notice] = 'Trail was saved successfully.'
      render :controller => 'trails', :action => 'draft'
    else
      @show_notifications = false
      flash[:error] = 'Trail could not be created.'
      render :action => 'draft'
    end
    
    
  end
  
  
  
  def publish_draft
    @trail = Trail.find(params[:id])
    
    if(@trail.user && @trail.user.id != current_user || @trail.user.nil?)
      redirect_to :action => "show", :id => @trail.id
      return
    end
    
    args = ActiveSupport::JSON.decode(params[:trail])
    @links = args["links"]
    
    # TODO: IMPROVE PERFORMANCE! EVEN WHEN THE SAVE FAILS, THIS GETS RE-CREATED
    @trail.caption = args["title"]
    @trail.articles.clear
    
    construct_trail
    @trail.draft = false
    
    
	  if !@has_errors && @trail.save
      flash[:notice] = 'Trail was successfully created.'
      redirect_to :controller => 'trails', :action => 'show', :id => @trail.id
    else
      @show_notifications = false
      flash[:error] = 'Trail could not be created.'
      render :action => 'draft'
    end
	  
    

  end
  
  
  
  
  
  
  def new
    
    @trail = Trail.new
    @trail.caption = params[:title]
    @articles = nil
    if params[:urls] then
      @articles = parse_urls(params[:urls])
    end
    
    
  end
  
  
  def clone
    
    @trail = Trail.find(params[:id])
    @articles = @trail.articles_json
    
    for article in @articles do
      hash = parse_url(article["url"]);
      if hash
        article[:pictures] = hash[:pictures];  
      end
      
    end
    
    render :action => "new"
    
  end
  
  
  
  def edit
    
    @trail = Trail.find(params[:id])
    
    if(@trail.user && @trail.user.id != current_user || @trail.user.nil?)
      redirect_to :action => "show", :id => @trail.id
      return false
    end
    
    
    @articles = @trail.articles_json
    
    for article in @articles do
      hash = parse_url(article["url"]);
      if hash
        article[:pictures] = hash[:pictures];  
      end
      
    end
    
  end
  
  def save_admin_changes
    if current_admin
      @trail = Trail.find(params[:id])
    
      if @trail.update_attributes(params[:trail])
        flash[:notice] = "Updated timeline settings" 
      else
        flash[:error] = "Could not save changes"
      end
    end
    
    redirect_to :controller => "trails", :action => "show", :id => @trail.id
    
  end
  
  
  def update
    
    @trail = Trail.find(params[:id])
    
    
    if(@trail.user && @trail.user.id != current_user || @trail.user.nil?)
      redirect_to :action => "show", :id => @trail.id
      return
    end
    
    
    args = ActiveSupport::JSON.decode(params[:trail])
    @links = args["links"]
    
    # TODO: IMPROVE PERFORMANCE! EVEN WHEN THE SAVE FAILS, THIS GETS RE-CREATED
    @trail.caption = args["title"]
    @trail.articles.clear
    
    construct_trail

	  if !@has_errors && @trail.save
      flash[:notice] = 'Trail was successfully created.'
      redirect_to :controller => 'trails', :action => 'show', :id => @trail.id
    else
      @show_notifications = false
      flash[:error] = 'Trail could not be created.'
      render :action => 'edit'
    end
    
    
  end
  
  
  
  
  def fullscreen
	
	@trail = Trail.find(params[:id])
    
    @articles = @trail.articles_json

    respond_to do |format|
      format.html { render :layout => false }
    end
  end
  
  def create
    
    args = ActiveSupport::JSON.decode(params[:trail])
    
    if(args == nil || args == "")
      redirect_to :controller => "trails", :action => "new"
      return
    end
    
    @links = args["links"]
        
    @trail = Trail.new
    @trail.caption = args["title"]

    if current_user
		  @trail.user_id = current_user
	  end

    construct_trail

	  if !@has_errors && @trail.save
      flash[:notice] = 'Trail was successfully created.'
      redirect_to :controller => 'trails', :action => 'show', :id => @trail.id
    else
      @show_notifications = false
      flash[:error] = 'Trail could not be created.'
      render :action => 'new'
    end
    
    
  end
  
  
  def process_urls
    @data = parse_urls(params[:urls])
    render :json => @data   
    
  end
  
  

  def slideshow
    render :layout => "slideshow"
  end



protected 


  def construct_trail
    @articles = [];
    @has_errors = false
    if @links.length < 3 || @links.length > 6 then

      @trail.valid?
      @trail.errors.add("articles", "Timelines must contain between 3 and 6 articles.")

      @has_errors = true;

    end

    @links.each do |link|
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
    
  end

  
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
  
  
  
  
=begin THIS USED TO BE IN CREATE
    @articles = [];
    has_errors = false
    if links.length < 3 || links.length > 6 then

      @trail.valid?
      @trail.errors.add("articles", "Timelines must contain between 3 and 6 articles.")

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
=end
  
  
  


end
