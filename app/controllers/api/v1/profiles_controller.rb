module Api
  module V1
    class ProfilesController < ApplicationController
      def index
        render json: Profile.all
      end

      def create
        render json: Profile.create!(profile_params)
      end

      private

      def profile_params
        params.require(:profile).permit(:display_name)
      end
    end
  end
end
