class Calibration < ApplicationRecord
  belongs_to :profile
  belongs_to :rubric
  belongs_to :from_weight, class_name: 'Weight'
  belongs_to :to_weight, class_name: 'Weight'

  validates :rating, numericality: { greater_than_or_equal_to: 0.11111, less_than_or_equal_to: 9 }
  validates :iteration, numericality: { greater_than_or_equal_to: 1 }

  validate :profile_is_member_of_rubric, :weights_are_member_of_rubric, :ensure_weights_are_different

  def self.update_rating(rubric:, profile:, from_weight:, to_weight:, rating:)
    calibration = Calibration.find_or_initialize_by(rubric:, profile:, from_weight:, to_weight:)
    inverse = Calibration.find_or_initialize_by(rubric:, profile:, from_weight: to_weight, to_weight: from_weight)

    calibration.rating = rating
    inverse.rating = 1.0 / rating

    update_iteration(rubric, profile, calibration, inverse)

    calibration.save
    inverse.save

    [calibration, inverse]
  end

  private

  def self.update_iteration(rubric, profile, calibration, inverse)
    max_iteration = Calibration.where(rubric:, profile:).maximum(:iteration)

    if max_iteration.present? && calibration.iteration < max_iteration
      calibration.iteration = max_iteration
      inverse.iteration = max_iteration
    elsif max_iteration.present?
      calibration.iteration = max_iteration + 1
      inverse.iteration = max_iteration + 1
    end
  end
  private_class_method :update_iteration

  def profile_is_member_of_rubric
    errors.add(:profile, 'is not a member of the rubric') unless rubric.profiles.include?(profile)
  end

  def weights_are_member_of_rubric
    errors.add(:to_weight, 'is not a member of the rubric') unless rubric.weights.include?(to_weight)
    errors.add(:from_weight, 'is not a member of the rubric') unless rubric.weights.include?(from_weight)
  end

  def ensure_weights_are_different
    errors.add(:to_weight, "can't be the same weight as the other half") if from_weight.id == to_weight.id
  end
end
