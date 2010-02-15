
require 'md5'
class User < ActiveRecord::Base
  has_many :trails, :order => "created_at DESC"
  has_many :articles, :through => :trails
  
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
