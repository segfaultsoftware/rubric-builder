module V1
  class ProfileSerializer
    include JSONAPI::Serializer

    attributes :id, :display_name
  end
end
