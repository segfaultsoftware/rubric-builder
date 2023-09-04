class AddUniqueIndexToRubric < ActiveRecord::Migration[7.0]
  def change
    add_index :rubrics, :name, unique: true
  end
end
