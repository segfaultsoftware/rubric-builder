module Api
  module V1
    class ProfilesController < ApplicationController
      def index
        render json: current_profile.rubrics.map(&:profiles).flatten.uniq
      end

      # TODO: maybe move this into a RubricProfilesController?
      def destroy
        rubric_profile = RubricProfile.find_by(profile_id:, rubric_id:)
        rubric_profile.destroy if rubric_profile.present?
        render head: :ok
      end

      private

      def profile_id
        current_profile.id
      end

      def rubric_id
        params[:rubric_id]
      end
    end
  end
end
