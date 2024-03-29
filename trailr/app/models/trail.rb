class Trail < ActiveRecord::Base
  belongs_to :user
  has_many :articles, :dependent => :destroy, :order => 'date ASC'
  
  validates_length_of :caption, :maximum => 150, :message => "must be less than 150 characters long."
  validates_presence_of :caption, :message => "Timelines must have a caption."
  
  
  def related_trails
    Trail.find_by_sql(["SELECT t2.* FROM trails AS t1 
    	JOIN articles AS a1 ON a1.trail_id = t1.id
    	JOIN articles AS a2 ON a2.url = a1.url
    	JOIN trails AS t2 ON t2.id = a2.trail_id
    WHERE t1.id = ? AND t2.id != ? AND t2.draft == ? AND t2.hidden == ?
    GROUP BY t2.id
    ORDER BY t2.front DESC, t2.demoted ASC, t2.viewcount DESC, t2.created_at DESC", self.id, self.id, false, false]);
  end
  
  
  
  def articles_json
    articles = []
    
    for a in self.articles
      
      hash = {}
      hash["headline"] = a.headline
      hash["url"] = a.url
      hash["source"] = a.source
      hash["image_url"] = a.image_url
      if !a.date.nil? then
        hash["date"] = a.date.strftime("%m/%d/%Y")
      else 
        hash["date"] = Time.new.strftime("%m/%d/%Y")
      end
      
      articles << hash
      
    end
    
    return articles
    
  end
  
end
