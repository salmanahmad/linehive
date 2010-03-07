
require 'md5'
class User < ActiveRecord::Base
  has_many :trails, :order => "created_at DESC"
  has_many :articles, :through => :trails
  
  
  validates_presence_of :username 
  validates_uniqueness_of :username

  validates_presence_of :password, :message => "did not match, or password fields left blank", :on => :create

  validates_uniqueness_of :email
  validates_presence_of :email 
  validates_format_of :email, :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i, :message => "Provide valid email"
  
  
  
  def published_trails
    Trail.find(:all, :conditions => {:user_id => self.id, :draft => false})
  end
  
  def drafts
    Trail.find(:all, :conditions => {:user_id => self.id, :draft => true})    
  end
  
  
	def self.authenticate(email, password)
		u=find(:first, :conditions=>["email = ?", email])
		if u.nil? 
			return nil
		elsif u["password"] == MD5::md5(password).hexdigest
      return [u["id"], u["username"], u["admin"]];
		else
			return nil
		end    
	end  
	
end
