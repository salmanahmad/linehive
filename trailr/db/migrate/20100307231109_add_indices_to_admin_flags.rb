class AddIndicesToAdminFlags < ActiveRecord::Migration
  def self.up
    add_index(:trails, :hidden)
    add_index(:trails, :demoted)
    add_index(:trails, :front)
    add_index(:trails, :draft)
    
  end

  def self.down
    remove_index(:trails, :hidden)
    remove_index(:trails, :demoted)
    remove_index(:trails, :front)
    remove_index(:trails, :draft)
  end
end
