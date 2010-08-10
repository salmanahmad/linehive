class AddConfirmationAndEditRange < ActiveRecord::Migration
  def self.up
    add_column :trails, :confirmation, :string
    add_column :trails, :start_task, :datetime
    add_column :trails, :end_task, :datetime
  end

  def self.down
    remove_column :trails, :confirmation
    remove_column :trails, :start_task
    remove_column :trails, :end_task
  end
end
