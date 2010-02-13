require 'md5'

class UserController < ApplicationController

  def signon
    if current_user
      redirect_to :controller => :home, :action => :index
    end
  end
  
  def process_signon
    if request.post?
       if user = User.authenticate(params[:user][:email], params[:user][:password])
         session[:user] = user
         redirect_to :controller => :home, :action => :index
       else
         session[:user] = nil
         redirect_to :controller => "user", :action => "signon"            
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
  end
end
