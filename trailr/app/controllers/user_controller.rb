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
      @customer = Customer.new(params[:customer])
      @customer.password = (params[:customer][:password] != '' && params[:confirm_password] == params[:customer][:password]) ? MD5::md5(params[:customer][:password]).hexdigest : nil

      if @customer.save
        session[:user] = [@customer.id, @customer.first_name]
        
        @contact_info = ContactInfo.new(params[:contact_info])
        @customer.contact_infos << @contact_info
        
        flash[:notice] = 'Congrats! Your account has been created. You can update your information by clicking "Account"'
        redirect_to :controller => :search, :action => :home    
      else
        @customer.password = ""
        flash[:notice] = 'Customer could not be created. Please check your input.'
        render :action => 'signon'
      end

    end
    
    
  end
  
    
  def process_edit
    @user = User.find(current_user)
    @user.update_attributes(params[:user])
  end
end
