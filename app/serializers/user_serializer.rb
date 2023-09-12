class UserSerializer
  include JSONAPI::Serializer
  attributes :id, :email, :created_at

  attribute :profile_id do |user|
    user.profile.id
  end

  attribute :display_name do |user|
    user.profile.display_name
  end
end
