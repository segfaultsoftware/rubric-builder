# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    include RackSessionFix
    respond_to :json

    private

    def respond_with(resource, _opts = {})
      render json: logged_in_successfully(resource), status: :created
    end

    def respond_to_on_destroy
      if current_user
        render json: logged_out_successfully, status: :ok
      else
        render json: not_logged_in, status: :unauthorized
      end
    end

    def logged_in_successfully(resource)
      UserSerializer.new(resource).serializable_hash[:data][:attributes]
    end

    def logged_out_successfully
      {
        message: 'Logged out successfully.'
      }
    end

    def not_logged_in
      {
        message: "Couldn't find an active session."
      }
    end
  end
end
