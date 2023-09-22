module Api
  module V1
    class BrowserSubscriptionsController < ApplicationController
      def show
        render json: {
          vapid_public_key: Base64.urlsafe_decode64(Rails.application.secrets.vapid_public_key).bytes
        }
      end

      def update
        subscription = ProfileSubscription.find_or_initialize_by(profile_id: current_profile.id, endpoint:)
        subscription.auth = auth
        subscription.p256dh = p256dh
        subscription.save!

        render head: :ok
      end

      private

      def endpoint
        params[:subscription][:endpoint]
      end

      def auth
        params[:subscription][:keys][:auth]
      end

      def p256dh
        params[:subscription][:keys][:p256dh]
      end
    end
  end
end
