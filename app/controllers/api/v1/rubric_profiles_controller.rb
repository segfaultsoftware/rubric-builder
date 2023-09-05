module Api
  module V1
    class RubricProfilesController < ApplicationController
      def create
        RubricProfile.create!(
          profile_id: params[:profile_id],
          rubric_id: params[:rubric_id]
        )
        render head: :created
      end

      def destroy
        rubric_profile = RubricProfile.find(params[:id])
        rubric_profile.delete
        render head: :ok
      end
    end
  end
end
