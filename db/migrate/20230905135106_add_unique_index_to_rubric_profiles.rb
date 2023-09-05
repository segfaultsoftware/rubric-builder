class AddUniqueIndexToRubricProfiles < ActiveRecord::Migration[7.0]
  def change
    add_index :rubric_profiles, [:rubric_id, :profile_id], unique: true
  end
end
