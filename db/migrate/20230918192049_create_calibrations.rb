class CreateCalibrations < ActiveRecord::Migration[7.0]
  def change
    create_table :calibrations do |t|
      t.references :profile, null: false
      t.references :rubric, null: false
      t.references :from_weight, foreign_key: { to_table: :weights }, null: false
      t.references :to_weight, foreign_key: { to_table: :weights }, null: false

      t.float :rating, default: 1.0, null: false
      t.integer :iteration, default: 1, null: false

      t.timestamps
    end

    add_index :calibrations, [:profile_id, :from_weight_id, :to_weight_id], unique: true, name: 'unique_calibrations_idx'
  end
end

