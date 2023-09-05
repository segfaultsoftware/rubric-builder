class Profile < ApplicationRecord
  has_many :profile_weights, dependent: :destroy

  default_scope { order(id: :asc) }
end
