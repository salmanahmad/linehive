# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

  # Scrub sensitive parameters from your log
  # filter_parameter_logging :password
  
  
  
  # These methods are included to check if the user is autenticated
  # The information is actually stored in the session, so these methods
  # have been added to make the code more readable and organized
  def current_user
    if session[:user]
      session[:user][0]
    else
      false
    end
  end
  
  def current_username
    if session[:user]
      session[:user][1]
    else
      false
    end
  end
  
  def current_trails
	if session[:trails]
		session[:trails]
	else
		session[:trails] = Array.new
	end
  end
end
