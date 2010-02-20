class ApiController < ApplicationController

  def list_users
    
    output = "lists_users"
    f = "";
    
    #if(params[:format])
    #  output += params[:format]
    #else 
    #  output += " json"
    #end
=begin    
    case params[:format]
      when "xml" then f = "xml"
      when "json" then f = "json"
      else f = "html"
    end
    
    render :text => "#{output} #{f}"
=end

    @users = ["salman", "frank", "neema", "chigusa"]
    
    respond_to do |format|
      format.html 
      format.xml
      format.json
    end    
    
  end

end
