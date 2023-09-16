module Users
  class InvitationsController < Devise::InvitationsController
    include RackSessionFix
    respond_to :json

    before_action :configure_permitted_parameters

    def edit
      set_minimum_password_length
      resource.invitation_token = params[:invitation_token]
      json = ::V1::InvitationSerializer.new(resource).serializable_hash[:data][:attributes]
      render json:
    end

    def update
      raw_invitation_token, invitation_accepted = accept_invitation

      json = invitation_accepted ? prepare_invitation_accepted : prepare_invitation_not_accepted(raw_invitation_token)

      render json:
    end

    private

    def accept_invitation
      raw_invitation_token = update_resource_params[:invitation_token]
      self.resource = accept_resource
      invitation_accepted = resource.errors.empty?
      { raw_invitation_token:, invitation_accepted: }
    end

    def prepare_invitation_accepted
      resource.after_database_authentication
      sign_in(resource_name, resource)
      UserSerializer.new(resource).serializable_hash[:data][:attributes]
    end

    def prepare_invitation_not_accepted(raw_invitation_token)
      resource.invitation_token = raw_invitation_token
      ::V1::InvitationSerializer.new(resource).serializable_hash[:data][:attributes]
    end

    def update_resource_params
      devise_parameter_sanitizer.sanitize(:invitation)
    end

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:invitation, keys: [:password, :invitation_token])
    end
  end
end
