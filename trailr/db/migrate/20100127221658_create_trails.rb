class CreateTrails < ActiveRecord::Migration
  def self.up
    create_table :trails do |t|
      t.integer :user_id
      t.string :caption
      t.integer :viewcount, :default => 0
      t.timestamps
    end
    
    add_index(:trails, :user_id)
    add_index(:trails, :caption)
    add_index(:trails, :viewcount)
    
  end

  def self.down
    drop_table :trails
  end
end
