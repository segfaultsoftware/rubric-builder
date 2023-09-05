module V1
  class ProfileWeightSerializer
    include JSONAPI::Serializer

    attributes :id, :value, :profile_id, :weight_id
  end
end
