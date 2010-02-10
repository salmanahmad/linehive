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

end
