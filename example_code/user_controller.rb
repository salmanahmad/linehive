# The user controller allows for creation and account
# updates to the customers

require 'md5'
class UserController < ApplicationController
  
  def account
    @customer = Customer.find(current_user)
    @invoices = @customer.invoices.find(:all, :order => "created_at DESC")
    
  end
  
  
  
  def process_edit
    @customer = Customer.find(current_user)
    
    if @customer.update_attributes(params[:customer])
      redirect_to :action => :account
      flash[:notice] = "Settings Updated"
    else
      render :action => :account
    end
  end
  
    
  def process_create
    if current_user then
      redirect_to :controller => :search, :action => :home    
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
  
  
  
  def signon
    if current_user
      redirect_to :controller => :search, :action => :home
    end
    
  end
  
  def process_signon
    if request.post?
       
       if user = Customer.authenticate(params[:user][:email], params[:user][:password])
         session[:user] = user
         flash[:notify]  = "Login successful"
         
         # now comes the tricky part...I have to synchronize the session cart with the user cart...or  not..
         
         if !session[:cart].nil? then
            # the session cart does have some stuff in it
            @user = Customer.find(current_user)
            
            cart = session[:cart]
            
            cart.each do |item_id, quantity|
              #implement later
            end
            
         end
         
         
         redirect_to :controller => :search, :action => :home
         
       else
         session[:user] = nil
         flash[:error] = "Login unsuccessful. Try again."
         flash[:notice] = flash[:error]
         redirect_to :controller => "user", :action => "signon"            
       end
       
     end
    
  end

  def signout
    session[:user] = nil
    session[:cart] = nil
    redirect_to :action => "signon"
  end

end
