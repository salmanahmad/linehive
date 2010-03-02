class ChangeDefaultDatatypeForDrafts < ActiveRecord::Migration
  def self.up
    change_column :trails, :draft, :boolean, :default => false
  end

  def self.down
    add_column :trails, :draft, :boolean, :default => "0"
  end
end
