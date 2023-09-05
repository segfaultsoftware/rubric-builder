class CreateProfileWeights < ActiveRecord::Migration[7.0]
  def change
    create_table :profile_weights do |t|
      t.references :weight
      t.references :profile

      t.float :value, default: 1.0

      t.timestamps
    end

    add_index :profile_weights, [:weight_id, :profile_id], unique: true
  end
end
