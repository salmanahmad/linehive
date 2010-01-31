class AddImageUrlToArticles < ActiveRecord::Migration
  def self.up
    add_column :articles, :image_url, :string
  end

  def self.down
    remove_column :articles, :image_url
  end
end
