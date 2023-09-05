class Weight < ApplicationRecord
  belongs_to :rubric

  has_many :profile_weights, dependent: :destroy

  default_scope { order(id: :asc) }

  validates :name, presence: true, uniqueness: { scope: :rubric }
end
