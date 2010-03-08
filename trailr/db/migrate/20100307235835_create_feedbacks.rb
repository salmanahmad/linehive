class CreateFeedbacks < ActiveRecord::Migration
  def self.up
    create_table :feedbacks do |t|
      t.integer :user_id
      t.boolean :can_contact, :default => false

      t.string :comment
      t.string :email
      t.string :name
      t.string :page
      
      t.timestamps
    end
  end

  def self.down
    drop_table :feedbacks
  end
end
