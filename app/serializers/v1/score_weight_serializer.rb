module V1
  class ScoreWeightSerializer
    include JSONAPI::Serializer
    attributes :id, :weight_id, :value
  end
end
