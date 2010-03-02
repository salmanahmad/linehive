class AddDraftsToTrails < ActiveRecord::Migration
  def self.up
    add_column :trails, :draft, :boolean, :default => "0"
    
  end

  def self.down
    remove_column :trails, :draft
  end
end
