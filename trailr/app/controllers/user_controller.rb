require 'md5'

class UserController < ApplicationController
  include UserHelper
  
  def account
  	if current_user
  		@user = User.find(current_user)
  		@trails = @user.trails
		
  		#@recent_trails = session[:trails];
  		#if(@recent_trails.nil?) 
  		#	@recent_trails = []
  		#end
		
  		#session[:trails] = Array.new	
  		#session[:trails] = Trail.find(:all, :conditions => [" user_id = ? ", current_user ])
  	else 
  		redirect_to :controller => "home", :action => "index"
  	end
	
  end
  
  def signon
    if current_user
      redirect_to :controller => :user, :action => :account
    end
    # Iterate on saving current session. Snippet: <% for @trail in session[:trails] %>
  end
  
  def process_signon
    if request.post?
       if user = User.authenticate(params[:user][:email], params[:user][:password])
         session[:user] = user
         redirect_to :controller => :user, :action => :account
       else
         session[:user] = nil
         redirect_to :controller => :user, :action => :signon
       end
       
     end
    
  end

  def signout
    session[:user] = nil
    redirect_to :action => "signon"
  end

  def process_create
    if current_user then
      redirect_to :controller => :home, :action => :index    
    else
      @user = User.new(params[:user])
      @user.password = (params[:user][:password] != '' && params[:confirm_password] == params[:user][:password]) ? MD5::md5(params[:user][:password]).hexdigest : nil

      if @user.save
        session[:user] = [@user.id, @user.handle]        
        flash[:notice] = 'Congrats! Your account has been created. You can update your information by clicking "Account"'
		
# Iterate on saving current session. Snippet: <% for @trail in session[:trails] %>
        redirect_to :controller => :home, :action => :index    
      else
        @customer.password = ""
        flash[:notice] = 'User could not be created. Please check your input.'
        render :action => 'signon'
      end

    end
    
    
  end
  
    
  def process_edit
    @user = User.find(current_user)
    @user.update_attributes(params[:user])
	  flash[:notice] = 'Congrats! Your account has been updated.'
  end
  
end
