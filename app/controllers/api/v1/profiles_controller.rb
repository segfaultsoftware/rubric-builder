module Api
  module V1
    class ProfilesController < ApplicationController
      # TODO: maybe move this into a RubricProfilesController?
      def destroy
        rubric.remove_member(member)
        render head: :ok
      end

      private

      def rubric
        current_profile.rubrics.find(params[:rubric_id])
      end

      def member
        Profile.find(params[:id])
      end
    end
  end
end
