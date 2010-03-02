
require 'md5'
class User < ActiveRecord::Base
  has_many :trails, :order => "created_at DESC"
  has_many :articles, :through => :trails
  
  def published_trails
    Trail.find(:all, :conditions => {:user_id => self.id, :draft => 0})
  end
  
  def drafts
    Trail.find(:all, :conditions => {:user_id => self.id, :draft => 1})    
  end
  
  
	def self.authenticate(email, password)
		u=find(:first, :conditions=>["email = ?", email])
		if u.nil? 
			return nil
		elsif u["password"] == MD5::md5(password).hexdigest
			return [u["id"], u["handle"]];
		else
			return nil
		end    
	end  
	
end
