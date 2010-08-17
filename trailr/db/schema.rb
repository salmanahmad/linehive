# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20100817062439) do

  create_table "articles", :force => true do |t|
    t.integer  "trail_id",   :null => false
    t.datetime "date"
    t.string   "headline"
    t.string   "source"
    t.string   "url"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_url"
  end

  add_index "articles", ["date"], :name => "index_articles_on_date"
  add_index "articles", ["headline"], :name => "index_articles_on_headline"
  add_index "articles", ["source"], :name => "index_articles_on_source"
  add_index "articles", ["trail_id"], :name => "index_articles_on_trail_id"
  add_index "articles", ["url"], :name => "index_articles_on_url"

  create_table "feedbacks", :force => true do |t|
    t.integer  "user_id"
    t.boolean  "can_contact", :default => false
    t.string   "comment"
    t.string   "email"
    t.string   "name"
    t.string   "page"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "trails", :force => true do |t|
    t.integer  "user_id"
    t.string   "caption"
    t.integer  "viewcount",    :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "draft",        :default => false
    t.boolean  "demoted",      :default => false
    t.boolean  "hidden",       :default => false
    t.boolean  "front",        :default => false
    t.string   "confirmation"
    t.datetime "start_task"
    t.datetime "end_task"
    t.integer  "num_added"
    t.integer  "num_removed"
  end

  add_index "trails", ["caption"], :name => "index_trails_on_caption"
  add_index "trails", ["demoted"], :name => "index_trails_on_demoted"
  add_index "trails", ["draft"], :name => "index_trails_on_draft"
  add_index "trails", ["front"], :name => "index_trails_on_front"
  add_index "trails", ["hidden"], :name => "index_trails_on_hidden"
  add_index "trails", ["user_id"], :name => "index_trails_on_user_id"
  add_index "trails", ["viewcount"], :name => "index_trails_on_viewcount"

  create_table "users", :force => true do |t|
    t.string   "username"
    t.string   "email"
    t.string   "password"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "admin",      :default => false
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["username"], :name => "index_users_on_handle", :unique => true

end
