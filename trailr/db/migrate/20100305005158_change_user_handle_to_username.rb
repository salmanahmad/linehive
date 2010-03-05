class ChangeUserHandleToUsername < ActiveRecord::Migration
  def self.up
    rename_column :users, :handle, :username 
  end

  def self.down
    rename_column :users, :username, :handle
  end
end
