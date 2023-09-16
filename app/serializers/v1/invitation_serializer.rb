module V1
  class InvitationSerializer
    include JSONAPI::Serializer
    attributes :id, :email, :invitation_token, :errors
  end
end
