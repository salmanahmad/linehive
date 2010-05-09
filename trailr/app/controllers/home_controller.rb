class HomeController < ApplicationController
  
  def index
    redirect_to :controller => "trails", :action => "index"
    #redirect_to :controller => "trails", :action => "new"
  end

  def team
    
  end
  
  def about
    
  end

  def jetpack
    
  end

  def extension
    
  end

  # TODO: Remove this method. It does not belong here. It is only here so that the explore link goes somewhere...
  def explore 
    
  end

  def contact
    
  end
  
  def api
    
  end
  
  def terms
    
  end

  def privacy
    
  end

  def how
    
  end

  def embed_test
    
  end
  
  def featured  
  @trails = Trail.find :all, :conditions => {:draft => false, :hidden => false, :front => true}, :order => 'created_at DESC, viewcount DESC'
  end
  
  def recent  
  @trails = Trail.find :all, :conditions => {:draft => false, :hidden => false}, :order => 'created_at DESC, demoted ASC'
  end
  
  def popular  
  @trails = Trail.find :all, :conditions => {:draft => false, :hidden => false}, :order => 'viewcount DESC, demoted ASC, created_at DESC'
  end
end
