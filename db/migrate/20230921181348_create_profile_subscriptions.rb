class CreateProfileSubscriptions < ActiveRecord::Migration[7.0]
  def change
    create_table :profile_subscriptions do |t|
      t.references :profile
      t.string :endpoint, null: false
      t.string :auth, null: false
      t.string :p256dh, null: false

      t.timestamps
    end
  end
end
