# frozen_string_literal: true

module Users
  class RegistrationsController < Devise::RegistrationsController
    include RackSessionFix
    respond_to :json

    private

    def respond_with(resource, _opts = {})
      if request.method == 'POST' && resource.persisted?
        # TODO: somehow move this logic out of the rendering logic and out of the User#after_save hook
        resource.create_profile!(display_name: resource.email)
        render json: signed_up_successfully, status: :created
      elsif request.method == 'DELETE'
        render json: account_deleted_successfully, status: :ok
      else
        render json: user_not_created, status: :unprocessable_entity
      end
    end

    def signed_up_successfully
      UserSerializer.new(resource).serializable_hash[:data][:attributes]
    end

    def account_deleted_successfully
      {
        message: 'Account deleted successfully.'
      }
    end

    def user_not_created
      {
        errors: resource.errors
      }
    end
  end
end
