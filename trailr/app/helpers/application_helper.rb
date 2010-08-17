# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  
  def app_mode
    
    host = request.host
    
    if host.match(/af.linehive/i)
      return :AF
    elsif host.match(/au.linehive/i)
      return :AU
    elsif host.match(/pf.linehive/i)
      return :PF
    elsif host.match(/pu.linehive/i)
      return :PU
    end
    
    #return :PF
    #return :PU
    #return :AF
    return :AU
  end
  
  def default_javascript

    return '<script src="/javascripts/jquery-1.4.min.js"></script>
            <script src="/javascripts/jquery.livequery.js"></script>
            <script src="/javascripts/jquery.watermark.js"></script>
            <script src="/javascripts/jquery.ui.sortable.js"></script>
            <script src="/javascripts/json.js"></script>
            <script src="/javascripts/jquery.scrollTo.js"></script>
            



            <script src="/javascripts/application.js" type="text/javascript"></script>'

            #<script src="/javascripts/prototype.js" type="text/javascript"></script>
            #<script src="/javascripts/effects.js" type="text/javascript"></script>'
      
  end
  
  def current_user
    if session[:user]
      session[:user][0]
    else
      false
    end
  end
  
  def current_admin
    if current_user and session[:user][2]
      return true
    else
      return false
    end
  end
  
  def current_username
    if session[:user]
      session[:user][1]
    else
      false
    end
  end
  
end
