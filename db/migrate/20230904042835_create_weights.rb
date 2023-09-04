class CreateWeights < ActiveRecord::Migration[7.0]
  def change
    create_table :weights do |t|
      t.string :name
      t.text :description
      t.references :rubric

      t.timestamps
    end
  end
end
