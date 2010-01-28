class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      #signature is saved in the public directory...
      t.string :handle
      t.string :email
      t.string :password
      t.timestamps
    end
    
    add_index(:users, :handle, :unique => true)
    add_index(:users, :email, :unique => true)
    
    
  end

  def self.down
    drop_table :users
  end
end
