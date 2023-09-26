# Intentionally delegates everything to the Profile object.
# The client should never really need to know the User model details
class UserSerializer
  include JSONAPI::Serializer

  attribute :id do |user|
    user.profile.id
  end

  attribute :display_name do |user|
    user.profile.display_name
  end

  attribute :created_at do |user|
    user.profile.created_at
  end

  attribute :is_admin do |user|
    user.profile.is_admin?
  end
end
