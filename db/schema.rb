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

ActiveRecord::Schema[7.0].define(version: 2023_09_26_164906) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "calibrations", force: :cascade do |t|
    t.bigint "profile_id", null: false
    t.bigint "rubric_id", null: false
    t.bigint "from_weight_id", null: false
    t.bigint "to_weight_id", null: false
    t.float "rating", default: 1.0, null: false
    t.integer "iteration", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["from_weight_id"], name: "index_calibrations_on_from_weight_id"
    t.index ["profile_id", "from_weight_id", "to_weight_id"], name: "unique_calibrations_idx", unique: true
    t.index ["profile_id"], name: "index_calibrations_on_profile_id"
    t.index ["rubric_id"], name: "index_calibrations_on_rubric_id"
    t.index ["to_weight_id"], name: "index_calibrations_on_to_weight_id"
  end

  create_table "profile_subscriptions", force: :cascade do |t|
    t.bigint "profile_id"
    t.string "endpoint", null: false
    t.string "auth", null: false
    t.string "p256dh", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["profile_id"], name: "index_profile_subscriptions_on_profile_id"
  end

  create_table "profile_weights", force: :cascade do |t|
    t.bigint "weight_id"
    t.bigint "profile_id"
    t.float "value", default: 1.0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["profile_id"], name: "index_profile_weights_on_profile_id"
    t.index ["weight_id", "profile_id"], name: "index_profile_weights_on_weight_id_and_profile_id", unique: true
    t.index ["weight_id"], name: "index_profile_weights_on_weight_id"
  end

  create_table "profiles", force: :cascade do |t|
    t.string "display_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.boolean "is_admin", default: false, null: false
    t.index ["user_id"], name: "index_profiles_on_user_id", unique: true
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
    t.json "computed", default: "{}"
    t.string "descriptor", default: "", null: false
    t.integer "visibility", default: 0, null: false
    t.index ["author_id"], name: "index_rubrics_on_author_id"
    t.index ["name"], name: "index_rubrics_on_name", unique: true
    t.index ["visibility"], name: "index_rubrics_on_visibility"
  end

  create_table "score_weights", force: :cascade do |t|
    t.bigint "weight_id"
    t.bigint "score_id"
    t.integer "value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["score_id", "weight_id"], name: "index_score_weights_on_score_id_and_weight_id", unique: true
    t.index ["score_id"], name: "index_score_weights_on_score_id"
    t.index ["weight_id"], name: "index_score_weights_on_weight_id"
  end

  create_table "scores", force: :cascade do |t|
    t.bigint "profile_id"
    t.bigint "rubric_id"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["profile_id"], name: "index_scores_on_profile_id"
    t.index ["rubric_id", "profile_id"], name: "index_scores_on_rubric_id_and_profile_id"
    t.index ["rubric_id"], name: "index_scores_on_rubric_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "jti", null: false
    t.string "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer "invitation_limit"
    t.string "invited_by_type"
    t.bigint "invited_by_id"
    t.integer "invitations_count", default: 0
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["invitation_token"], name: "index_users_on_invitation_token", unique: true
    t.index ["invited_by_id"], name: "index_users_on_invited_by_id"
    t.index ["invited_by_type", "invited_by_id"], name: "index_users_on_invited_by"
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
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

  add_foreign_key "calibrations", "weights", column: "from_weight_id"
  add_foreign_key "calibrations", "weights", column: "to_weight_id"
  add_foreign_key "profiles", "users"
  add_foreign_key "rubrics", "profiles", column: "author_id"
end
