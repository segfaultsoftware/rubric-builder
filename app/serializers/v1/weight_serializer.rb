module V1
  class WeightSerializer
    include JSONAPI::Serializer
    attributes :id, :name, :description
  end
end
