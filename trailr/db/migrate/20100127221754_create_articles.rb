class CreateArticles < ActiveRecord::Migration
  def self.up
    create_table :articles do |t|
      t.integer :trail_id, :null => false
      t.date :date
      t.string :headline
      t.string :source
      t.string :url
      
      t.timestamps
    end
    
    add_index(:articles, :trail_id)
    add_index(:articles, :date)
    add_index(:articles, :headline)
    add_index(:articles, :source)
    add_index(:articles, :url)
    
  end

  def self.down
    drop_table :articles
  end
end
