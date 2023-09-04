class Weight < ApplicationRecord
  belongs_to :rubric

  default_scope { order(id: :asc) }

  validates :name, presence: true, uniqueness: { scope: :rubric }
end
