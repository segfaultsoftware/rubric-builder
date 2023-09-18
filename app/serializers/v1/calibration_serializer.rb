module V1
  class CalibrationSerializer
    include JSONAPI::Serializer
    attributes :id, :from_weight_id, :to_weight_id, :rating, :iteration
  end
end
