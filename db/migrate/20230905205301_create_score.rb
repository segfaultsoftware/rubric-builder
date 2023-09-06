class CreateScore < ActiveRecord::Migration[7.0]
  def change
    create_table :scores do |t|
      t.references :profile
      t.references :rubric

      t.string :name

      t.timestamps
    end

    add_index :scores, [:rubric_id, :profile_id]
  end
end
