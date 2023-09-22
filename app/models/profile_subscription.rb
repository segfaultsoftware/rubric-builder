class ProfileSubscription < ApplicationRecord
  belongs_to :profile

  validates :endpoint, presence: true
  validates :auth, presence: true
  validates :p256dh, presence: true
end
