class Trail < ActiveRecord::Base
  belongs_to :user
  has_many :articles, :dependent => :destroy
  
  validates_length_of :caption, :maximum => 150, :message => "must be less than 150 characters long."
  validates_presence_of :caption, :message => "Timelines must have a caption."
  
  def articles_json
    articles = []
    
    for a in self.articles
      
      hash = {}
      hash["headline"] = a.headline
      hash["url"] = a.url
      hash["source"] = a.source
      hash["image_url"] = a.image_url
      if !a.date.nil? then
        hash["date"] = a.date.rfc2822()                        
      else 
        hash["date"] = Time.new.rfc2822()
      end
      
      articles << hash
      
    end
    
    return articles
    
  end
  
end
