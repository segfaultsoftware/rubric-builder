module Api
  module V1
    class ProfilesController < ApplicationController
      def index
        render json: Profile.all
      end

      def create
        render json: Profile.create!(profile_params)
      end

      def destroy
        rubric_profile = RubricProfile.find_by(profile_id:, rubric_id:)
        rubric_profile.delete if rubric_profile.present?
        render head: :ok
      end

      private

      def profile_params
        params.require(:profile).permit(:display_name)
      end

      def profile_id
        params[:id]
      end

      def rubric_id
        params[:rubric_id]
      end
    end
  end
end
