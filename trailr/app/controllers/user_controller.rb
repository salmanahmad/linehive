require 'md5'

class UserController < ApplicationController
  include UserHelper
  
  def account
    
  	if current_user
  		@user = User.find(current_user)
  		@trails = @user.published_trails
  		@drafts = @user.drafts
  		
  		puts @drafts  
  	else 
  		redirect_to :controller => "home", :action => "index"
  	end
	
  end
  
  def signon
    if current_user
      redirect_to :controller => :user, :action => :account
    end
  end
  
  def process_signon
    if request.post?
       if user = User.authenticate(params[:user][:email], params[:user][:password])
         session[:user] = user
         redirect_to :controller => :user, :action => :account
       else
         session[:user] = nil
         flash[:error] = "Invalid email or password."
         redirect_to :controller => :user, :action => :signon
       end
       
     end
    
  end

  def signout
    session[:user] = nil
    redirect_to :action => "signon"
  end

  def process_create
    
    @show_notifications = false
    
    if current_user then
      redirect_to :controller => :home, :action => :index    
    else
      @user = User.new(params[:user])
      @user.password = (params[:user][:password] != '' && params[:confirm_password] == params[:user][:password]) ? MD5::md5(params[:user][:password]).hexdigest : nil

      if @user.save
        session[:user] = [@user.id, @user.username]        
        flash[:notice] = 'Congrats! Your account has been created. You can update your information by clicking "Account"'
        redirect_to :controller => :home, :action => :index    
      else
        @user.password = ""
        #flash[:error] = 'User could not be created. Please check your input.'
        render :action => 'signon'
      end

    end
    
    
  end
  
    
  def process_edit
=begin    
    @user = User.find(current_user)
    @user.update_attributes(params[:user])
	  flash[:notice] = 'Congrats! Your account has been updated.'
=end	  
  end
  
end
