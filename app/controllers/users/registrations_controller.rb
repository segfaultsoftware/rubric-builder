# frozen_string_literal: true

module Users
  class RegistrationsController < Devise::RegistrationsController
    include RackSessionFix
    respond_to :json

    private

    def respond_with(resource, _opts = {})
      if request.method == 'POST' && resource.persisted?
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
        message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}"
      }
    end
  end
end
