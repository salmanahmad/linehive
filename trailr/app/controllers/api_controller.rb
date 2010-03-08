class ApiController < ApplicationController
# TODO: Error handling

  def user
	if ! params[:format]
		format = "json"
		params[:format] = "json"
	else
		format = params[:format]
		
	end
	
	@user = User.find(:first, :conditions => [ "username = ? OR email = ?", params[:query], params[:query] ]);
	#@trails = Trail.find(:all, :conditions => { :user_id => @user.id } )
	@trails = @user.trails
	
	#render :text => "#{params[:query]} #{format}"
	respond_to do |format|
      format.xml
      format.json
    end
	
  end

  def url
	if ! params[:format]
		format = "json"
		params[:format] = "json"
	else
		format = params[:format]
	end
	escaped_url =  params[:query].gsub ('\\', '\\\\').gsub ('%', '\%').gsub ('_', '\_')
	@articles = Article.find(:all, :conditions => [ "url like ?" , "%#{params[:query]}%" ] )
	@trails = Array.new
	for @a in @articles
		@trails << Trail.find(:first, :conditions => ["id=?", @a.trail_id]);
	end
	
#render :text => "#{params[:query]} #{escaped_url}"
	
    respond_to do |format|
		format.json
		format.xml
	end
  end
  
  def search
	if ! params[:format]
		format = "json"
		params[:format] = "json"
	else
		format = params[:format]
	end
	q =  params[:query].gsub ('\\', '\\\\').gsub ('%', '\%').gsub ('_', '\_')
	@urls = Article.find(:all, :conditions => [ "url like ?" , "%#{q}%" ] )
	@trails = @urls.trails
	@trails.push(Trail.find(:all, :conditions => [ "caption like ?", "%#{q}%"] ))
	respond_to do |format|
      format.xml
      format.json
    end
  end
  
  def line
	if ! params[:format]
		format = "json"
		params[:format] = "json"
	else
		format = params[:format]
	end
	@articles = Article.find(:all, :conditions => ["trail_id = ?", params[:query]] )
	#render :text => "#{params[:query]} #{@articles.to_json}"
	respond_to do |format|
      format.xml
      format.json
    end
  end

end

=begin

code base from salman
  def list_users
    
    output = "lists_users"
    f = "";
    
    #if(params[:format])
    #  output += params[:format]
    #else 
    #  output += " json"
    #end

	# set default case
    case params[:format]
      when "xml" then f = "xml"
      when "json" then f = "json"
      else f = "html"
    end
    
    #render :text => "#{output} #{f}"

    @users = ["salman", "frank", "neema", "chigusa"]
    
	respond_to do |format|
      #format.html 
      format.xml
      format.json
    end    

  end
=end