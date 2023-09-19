FactoryBot.define do
  factory :score do
    profile
    rubric

    sequence(:name) { |n| "Score #{n}" }

    transient do
      score_weights { [] }
    end

    after(:create) do |score, context|
      context.score_weights.each do |score_weight|
        score.score_weights << score_weight
        score.save!
      end
    end
  end
end
