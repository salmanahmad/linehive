
require 'md5'
class User < ActiveRecord::Base
  has_many :trails
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
    
=begin    

  Frank start work here...

    sql = ActiveRecord::Base.connection();
    safe_email = sql.quote(email)
          	
  	u = sql.select_one("SELECT password, first_name, email, admin, id FROM customers WHERE customers.email = #{safe_email}");
        
    if u.nil? or u.empty?
      return nil
    elsif u["password"] == MD5::md5(password).hexdigest
      return [u["id"], u["first_name"], u["admin"]];
    else
      return nil
    end
    
=end
	end  
end
