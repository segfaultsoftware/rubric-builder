class Score < ApplicationRecord
  belongs_to :profile
  belongs_to :rubric

  has_many :score_weights, dependent: :destroy
  accepts_nested_attributes_for :score_weights, reject_if: :all_blank

  validates :name, presence: true
end
