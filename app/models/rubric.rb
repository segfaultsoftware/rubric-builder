class Rubric < ApplicationRecord
  belongs_to :author, class_name: 'Profile'

  has_many :weights, dependent: :destroy
  accepts_nested_attributes_for :weights, reject_if: :all_blank, allow_destroy: true

  validates :name, presence: true, uniqueness: true
end
