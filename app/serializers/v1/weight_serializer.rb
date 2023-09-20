module V1
  class WeightSerializer
    include JSONAPI::Serializer
    attributes :id, :name

    attribute :profile_weights do |weight, params|
      current_profile = params[:current_profile]
      weight.profile_weights.where(profile: current_profile).map do |profile_weight|
        ::V1::ProfileWeightSerializer.new(profile_weight).serializable_hash[:data][:attributes]
      end
    end
  end
end
