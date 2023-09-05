class RubricProfile < ApplicationRecord
  belongs_to :profile
  belongs_to :rubric

  validates :profile_id, uniqueness: { scope: :rubric_id }
end
