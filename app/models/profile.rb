class Profile < ApplicationRecord
  belongs_to :user

  has_many :profile_weights, dependent: :destroy
  has_many :scores, dependent: :destroy

  has_many :rubric_profiles, dependent: :destroy
  has_many :rubrics, through: :rubric_profiles

  default_scope { order(id: :asc) }
end
