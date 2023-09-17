module V1
  class RubricSerializer
    include JSONAPI::Serializer
    attributes :id, :name, :author_id

    attribute :weights do |rubric|
      rubric.weights.map do |weight|
        ::V1::WeightSerializer.new(weight).serializable_hash[:data][:attributes]
      end
    end

    attribute :members do |rubric|
      rubric.profiles.with_no_pending_invites.map do |profile|
        ::V1::ProfileSerializer.new(profile).serializable_hash[:data][:attributes]
      end
    end
  end
end
