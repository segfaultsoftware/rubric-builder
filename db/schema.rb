# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2023_09_05_135106) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "profiles", force: :cascade do |t|
    t.string "display_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "rubric_profiles", force: :cascade do |t|
    t.bigint "rubric_id"
    t.bigint "profile_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["profile_id"], name: "index_rubric_profiles_on_profile_id"
    t.index ["rubric_id", "profile_id"], name: "index_rubric_profiles_on_rubric_id_and_profile_id", unique: true
    t.index ["rubric_id"], name: "index_rubric_profiles_on_rubric_id"
  end

  create_table "rubrics", force: :cascade do |t|
    t.string "name"
    t.bigint "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_rubrics_on_author_id"
    t.index ["name"], name: "index_rubrics_on_name", unique: true
  end

  create_table "weights", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "rubric_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["rubric_id", "name"], name: "index_weights_on_rubric_id_and_name", unique: true
    t.index ["rubric_id"], name: "index_weights_on_rubric_id"
  end

  add_foreign_key "rubrics", "profiles", column: "author_id"
end
