class AddVisibilityToRubric < ActiveRecord::Migration[7.0]
  def change
    add_column :rubrics, :visibility, :integer, default: 0, null: false
    add_index :rubrics, :visibility
  end
end
