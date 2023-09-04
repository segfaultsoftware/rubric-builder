class AddUniqueIndexToWeight < ActiveRecord::Migration[7.0]
  def change
    add_index :weights, [:rubric_id, :name], unique: true
  end
end
