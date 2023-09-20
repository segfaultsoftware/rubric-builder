class AddDescriptorToRubrics < ActiveRecord::Migration[7.0]
  def up
    add_column :rubrics, :descriptor, :string, default: '', null: false
    execute 'UPDATE rubrics SET descriptor = name'
  end

  def down
    remove_column :rubrics, :descriptor
  end
end
