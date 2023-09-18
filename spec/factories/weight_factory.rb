FactoryBot.define do
  factory :weight do
    rubric

    sequence(:name) { |n| "Weight #{n}" }
    sequence(:description) { |n| "Description #{n}" }
  end
end
