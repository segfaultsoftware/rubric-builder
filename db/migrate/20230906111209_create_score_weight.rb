class CreateScoreWeight < ActiveRecord::Migration[7.0]
  def change
    create_table :score_weights do |t|
      t.references :weight
      t.references :score

      t.integer :value

      t.timestamps
    end

    add_index :score_weights, [:score_id, :weight_id], unique: true
  end
end
