class Rubric < ApplicationRecord
  belongs_to :author, class_name: 'Profile'

  has_many :weights, dependent: :destroy
  accepts_nested_attributes_for :weights, reject_if: :all_blank, allow_destroy: true

  has_many :rubric_profiles, dependent: :destroy
  has_many :profiles, through: :rubric_profiles

  validates :name, presence: true, uniqueness: true
end
