class AddingNumberLinksAddedRemoved < ActiveRecord::Migration
  def self.up
    add_column :trails, :num_added, :integer
    add_column :trails, :num_removed, :integer
  end

  def self.down
    remove_column :trails, :num_added
    remove_column :trails, :num_removed
  end
end
