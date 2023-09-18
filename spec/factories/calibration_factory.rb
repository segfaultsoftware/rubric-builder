FactoryBot.define do
  factory :calibration do
    rubric
    profile
    from_weight { association :weight }
    to_weight { association :weight }

    rating { (1..9).to_a.sample }

    after(:build) do |calibration|
      calibration.profile&.save!
      calibration.from_weight&.save!
      calibration.to_weight&.save!

      unless calibration.rubric.profiles.include?(calibration.profile)
        calibration.rubric.profiles << calibration.profile
      end
      unless calibration.rubric.weights.include?(calibration.from_weight)
        calibration.rubric.weights << calibration.from_weight
      end
      unless calibration.rubric.weights.include?(calibration.to_weight)
        calibration.rubric.weights << calibration.to_weight
      end
    end
  end
end
