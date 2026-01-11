class AddImageUrlToWeights < ActiveRecord::Migration[7.0]
  def change
    add_column :weights, :image_url, :string
  end
end
