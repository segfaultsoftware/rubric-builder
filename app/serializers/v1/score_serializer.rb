module V1
  class ScoreSerializer
    include JSONAPI::Serializer
    attributes :id, :name, :profile_id

    attribute :score_weights do |score|
      score.score_weights.map do |score_weight|
        ::V1::ScoreWeightSerializer.new(score_weight).serializable_hash[:data][:attributes]
      end
    end
  end
end
