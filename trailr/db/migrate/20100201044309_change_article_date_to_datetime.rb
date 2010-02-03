class ChangeArticleDateToDatetime < ActiveRecord::Migration
  def self.up
    change_column(:articles, :date, :datetime)
  end

  def self.down
    change_column(:articles, :date, :date)
  end
end
