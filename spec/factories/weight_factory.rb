FactoryBot.define do
  factory :weight do
    rubric

    sequence(:name) { |n| "Weight #{n}" }
    sequence(:description) { |n| "Description #{n}" }

    transient do
      profile_weights { [] }
    end

    after(:create) do |weight, context|
      context.profile_weights.each do |profile_weight|
        weight.profile_weights << profile_weight
        weight.save!
      end
    end
  end
end
