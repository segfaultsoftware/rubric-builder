module Api
  module V1
    class RubricProfilesController < ApplicationController
      def create
        rubric.profiles << Profile.find_by!(email: params[:email])
        rubric.save!
        rubric.initialize_profile_weights!
        render head: :created
      end

      def destroy
        rubric_profile = current_profile.rubric_profiles.find(params[:id])
        rubric_profile.destroy
        render head: :ok
      end

      private

      def rubric
        current_profile.rubrics.find(params[:rubric_id])
      end
    end
  end
end
