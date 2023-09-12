class ProfileWeight < ApplicationRecord
  belongs_to :weight
  belongs_to :profile

  default_scope { order(id: :asc) }

  validates :value, numericality: { greater_than_or_equal_to: 0.0 }

  def self.update_calibrations!(calibrations, profile)
    ActiveRecord::Base.transaction do
      calibrations.each do |calibration|
        profile_weight = ProfileWeight.find_by!(
          weight_id: calibration[:weight_id],
          profile_id: profile.id
        )
        profile_weight.value = calibration[:value]
        profile_weight.save!
      end
    end
  end
end
