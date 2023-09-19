FactoryBot.define do
  factory :rubric do
    sequence(:name) { |n| "Rubric #{n}" }
    author { association :profile }

    transient do
      members { [] }
      weights { [] }
    end

    after(:create) do |rubric, context|
      rubric.profiles << rubric.author
      context.members.each do |member|
        rubric.profiles << member
      end
      context.weights.each do |weight|
        rubric.weights << weight
        rubric.save!
      end
    end
  end
end
