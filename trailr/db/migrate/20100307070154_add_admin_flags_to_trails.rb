class AddAdminFlagsToTrails < ActiveRecord::Migration
  def self.up
    add_column :trails, :demoted, :boolean, :default => false
    add_column :trails, :hidden, :boolean, :default => false    
  end

  def self.down
    remove_column :trails, :demoted
    remove_column :trails, :hidden
  end
end
