module V1
  class RubricSerializer
    include JSONAPI::Serializer
    attributes :id, :name
    attribute :weights do |rubric|
      rubric.weights.map do |weight|
        ::V1::WeightSerializer.new(weight).serializable_hash[:data][:attributes]
      end
    end
  end
end
