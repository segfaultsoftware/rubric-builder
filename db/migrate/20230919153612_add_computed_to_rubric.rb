class AddComputedToRubric < ActiveRecord::Migration[7.0]
  def change
    add_column :rubrics, :computed, :json, default: '{}'
  end
end
