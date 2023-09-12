class Profile < ApplicationRecord
  belongs_to :user

  has_many :profile_weights, dependent: :destroy
  has_many :scores, dependent: :destroy

  default_scope { order(id: :asc) }
end
