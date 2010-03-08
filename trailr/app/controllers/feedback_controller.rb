class FeedbackController < ApplicationController

  def index
    @feedback = Feedback.new
    @feedback.page = params[:page]
  end
  
  def create

    @feedback = Feedback.new(params[:feedback])
    if current_user then
      @feedback.user_id = current_user
    end

    if @feedback.save 
      redirect_to :controller => "feedback", :action => "thanks"
    else
      @show_notifications = false
      render :action => "index"
      
    end
  end
  
  def thanks
    
  end
  
  def list
    if current_admin
      
    else
      redirect_to "/"
    end
  end

end
