module V1
  class WeightSerializer
    include JSONAPI::Serializer
    attributes :id, :name, :description

    attribute :profile_weights do |weight|
      weight.profile_weights.map do |profile_weight|
        ::V1::ProfileWeightSerializer.new(profile_weight).serializable_hash[:data][:attributes]
      end
    end
  end
end
