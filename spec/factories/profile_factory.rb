FactoryBot.define do
  factory :profile do
    sequence(:display_name) { |n| "Profile #{n}" }
    user

    transient do
      rubric { nil }
    end

    after(:create) do |profile, context|
      context.rubric.profiles << profile if context.rubric.present?
    end
  end
end
