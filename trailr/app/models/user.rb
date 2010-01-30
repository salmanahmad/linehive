class User < ActiveRecord::Base
  has_many :trails
  has_many :articles, :through => :trails
end
