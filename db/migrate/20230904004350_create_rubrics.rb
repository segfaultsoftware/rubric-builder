class CreateRubrics < ActiveRecord::Migration[7.0]
  def change
    create_table :rubrics do |t|
      t.string :name
      t.references :author, foreign_key: { to_table: :profiles }

      t.timestamps
    end
  end
end
