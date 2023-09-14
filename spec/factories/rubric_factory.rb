FactoryBot.define do
  factory :rubric do
    sequence(:name) { |n| "Rubric #{n}" }
    author { association :profile }

    transient do
      members { [] }
    end

    after(:create) do |rubric, context|
      rubric.profiles << rubric.author
      context.members.each do |member|
        rubric.profiles << member
      end
    end
  end
end
