class ScoreWeight < ApplicationRecord
  belongs_to :weight
  belongs_to :score

  validates :value, presence: true, numericality: {
    greater_than_or_equal_to: 0, less_than_or_equal_to: 5
  }
end
