class AddFrontPageAdminFlag < ActiveRecord::Migration
  def self.up
    add_column :trails, :front, :boolean, :default => false
  end

  def self.down
    remove_column :trails, :front
  end
end
