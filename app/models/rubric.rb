class Rubric < ApplicationRecord
  belongs_to :author, class_name: 'Profile'

  has_many :weights, dependent: :destroy
  accepts_nested_attributes_for :weights, reject_if: :all_blank, allow_destroy: true

  has_many :rubric_profiles, dependent: :destroy
  has_many :profiles, through: :rubric_profiles

  has_many :scores, dependent: :destroy

  validates :name, presence: true, uniqueness: true

  # for every member of the rubric, for every weight of the rubric, create a profile_weight
  def initialize_profile_weights!
    profiles.each do |profile|
      weights.each do |weight|
        ProfileWeight.find_or_create_by(profile:, weight:)
      end
    end
  end
end
