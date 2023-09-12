class AddUserIdToProfiles < ActiveRecord::Migration[7.0]
  def change
    add_column :profiles, :user_id, :bigint
    add_foreign_key :profiles, :users, column: :user_id
    add_index :profiles, :user_id, unique: true
  end
end
