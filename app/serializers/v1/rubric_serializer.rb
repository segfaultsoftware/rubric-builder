module V1
  class RubricSerializer
    include JSONAPI::Serializer
    attributes :id, :name, :descriptor, :visibility, :author_id

    attribute :weights do |rubric, params|
      rubric.weights.map do |weight|
        ::V1::WeightSerializer.new(
          weight,
          params: { current_profile: params[:current_profile] }
        ).serializable_hash[:data][:attributes]
      end
    end

    attribute :members do |rubric|
      rubric.profiles.with_no_pending_invites.map do |profile|
        ::V1::ProfileSerializer.new(profile).serializable_hash[:data][:attributes]
      end
    end

    attribute :pairings do |rubric, params|
      rubric.pairings_for_profile(params[:current_profile])
    end

    attribute :author do |rubric|
      ::V1::ProfileSerializer.new(rubric.author).serializable_hash[:data][:attributes]
    end
  end
end
