class InvertAllCalibrationRatings < ActiveRecord::Migration[7.0]
  def change
    execute 'UPDATE calibrations SET rating = 1 / rating'
  end
end
