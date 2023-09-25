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
      invitation_accepted = accept_invitation

      json = invitation_accepted ? prepare_invitation_accepted : prepare_invitation_not_accepted

      render json:, status: invitation_accepted ? :created : :unprocessable_entity
    end

    private

    def accept_invitation
      update_resource_params[:invitation_token]
      self.resource = accept_resource
      resource.errors.empty?
    end

    # rubocop:disable Metrics/AbcSize
    def prepare_invitation_accepted
      resource.after_database_authentication
      sign_in(resource_name, resource)
      resource.profile.rubrics.each do |rubric|
        rubric.accept_invitation!(resource.profile)
      end
      UserSerializer.new(resource).serializable_hash[:data][:attributes]
    end
    # rubocop:enable Metrics/AbcSize

    def prepare_invitation_not_accepted
      {
        errors: resource.errors.full_messages
      }
    end

    def update_resource_params
      devise_parameter_sanitizer.sanitize(:invitation)
    end

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:invitation, keys: [:password, :invitation_token])
    end
  end
end
