# rubocop:disable Metrics/ClassLength
class Rubric < ApplicationRecord
  belongs_to :author, class_name: 'Profile'

  has_many :weights, dependent: :destroy
  accepts_nested_attributes_for :weights, reject_if: :all_blank, allow_destroy: true

  has_many :rubric_profiles, dependent: :destroy
  has_many :profiles, through: :rubric_profiles

  has_many :scores, dependent: :destroy
  has_many :calibrations, dependent: :destroy

  default_scope { order(id: :asc) }

  validates :name, presence: true, uniqueness: true

  # for every member of the rubric, for every weight of the rubric, create a profile_weight
  def initialize_profile_weights!
    profiles.each do |profile|
      weights.each do |weight|
        ProfileWeight.find_or_create_by(profile:, weight:)
      end
    end
  end

  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
  def calculations
    calculations_by_score_name_profile_weight = {}

    profile_weights = weights.map(&:profile_weights).flatten
    profile_weights_by_profile_weight = {}
    profile_weights.each do |profile_weight|
      profile_weight_by_weight = profile_weights_by_profile_weight[profile_weight.profile_id] ||= {}
      profile_weight_by_weight[profile_weight.weight_id] = profile_weight
    end

    scores.each do |score|
      calculations_by_profile_weight = calculations_by_score_name_profile_weight[score.name] ||= {}
      calculations_by_weight = calculations_by_profile_weight[score.profile_id] ||= {}
      total = 0
      score.score_weights.each do |score_weight|
        from_score = score_weight.value
        from_pw = profile_weights_by_profile_weight.dig(score.profile_id, score_weight.weight_id)&.value
        # from_pw = profile_weights_by_profile_weight[score.profile_id][score_weight.weight_id] || 1.0

        calculations_by_weight[score_weight.weight_id] = from_score * from_pw
        total += calculations_by_weight[score_weight.weight_id]
      end
      calculations_by_weight[-1] = total
    end

    calculations_by_score_name_profile_weight
  end
  # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity

  # http://www.gitta.info/Suitability/en/html/Normalisatio_learningObject3.html
  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
  def update_profile_weights_for_profile!(profile)
    weight_ids = profile.profile_weights.map(&:weight_id)
    calibrations_matrix = {}

    weight_ids.each do |from_weight_id|
      weight_ids.each do |to_weight_id|
        row = calibrations_matrix[from_weight_id] ||= Hash.new(1.0)
        calibration = Calibration.find_by(rubric: self, profile:, from_weight_id:, to_weight_id:)
        row[to_weight_id] = calibration.present? ? calibration.rating : 1.0
      end
    end

    column_sums = Hash.new(0.0)
    weight_ids.each do |from_weight_id|
      weight_ids.each do |to_weight_id|
        column_sums[to_weight_id] += calibrations_matrix[from_weight_id][to_weight_id]
      end
    end

    row_sums = Hash.new(0.0)
    calibration_to_sum_matrix = {}
    weight_ids.each do |from_weight_id|
      weight_ids.each do |to_weight_id|
        row = calibration_to_sum_matrix[from_weight_id] ||= Hash.new(0.0)
        row[to_weight_id] = calibrations_matrix[from_weight_id][to_weight_id] / column_sums[to_weight_id]
        row_sums[from_weight_id] += row[to_weight_id]
      end
    end

    row_sums.each_key do |weight_id|
      weighted_value = row_sums[weight_id] / row_sums.size
      profile_weight = profile.profile_weights.find_by(weight_id:)
      profile_weight.value = weighted_value
      profile_weight.save!
    end
  end
  # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity

  def remove_member(profile)
    raise CannotRemoveAuthorFromRubricError if profile == author

    rubric_profile = rubric_profiles.find_by(profile_id: profile.id)
    rubric_profile.destroy if rubric_profile.present?
  end

  def generate_pairings_for_profile!(profile)
    to_calibrate = stale_calibrations_for_profile(profile)
    pairings = set_pairings_for_profile(profile, to_calibrate)
    save!
    pairings
  end

  def pairings_for_profile(profile)
    pairings = computed['pairings'] || {}
    pairings[profile.id.to_s] || []
  end

  class CannotRemoveAuthorFromRubricError < StandardError
    def message
      'Cannot remove the author from a rubric'
    end
  end

  private

  def stale_calibrations_for_profile(profile)
    all_combinations = weights.map(&:id).combination(2).to_a
    max_iteration = Calibration.where(rubric: self, profile:).maximum(:iteration)
    current_calibrations = Calibration
                           .where(rubric: self, profile:, iteration: max_iteration)
                           .pluck(:from_weight_id, :to_weight_id)

    to_calibrate = all_combinations - current_calibrations
    to_calibrate = all_combinations if to_calibrate.empty?
    to_calibrate
  end

  def set_pairings_for_profile(profile, to_calibrate)
    computed_cache = computed.is_a?(String) ? JSON.parse(computed) : computed.clone
    pairings = computed_cache['pairings'] || {}
    pairings[profile.id] = to_calibrate
    computed_cache['pairings'] = pairings

    self.computed = computed_cache

    to_calibrate
  end
end
# rubocop:enable Metrics/ClassLength
