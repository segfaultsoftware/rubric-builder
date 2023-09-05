class CreateRubricProfile < ActiveRecord::Migration[7.0]
  def change
    create_table :rubric_profiles do |t|
      t.references :rubric
      t.references :profile

      t.timestamps
    end
  end
end
