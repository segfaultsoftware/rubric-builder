FactoryBot.define do
  factory :profile do
    sequence(:display_name) { |n| "Profile #{n}" }
    user
  end
end
