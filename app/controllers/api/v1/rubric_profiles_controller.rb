module Api
  module V1
    class RubricProfilesController < ApplicationController
      def create
        RubricProfile.create!(
          profile_id: params[:profile_id],
          rubric_id: params[:rubric_id]
        )
        Rubric.find(params[:rubric_id]).initialize_profile_weights!
        render head: :created
      end

      def destroy
        rubric_profile = RubricProfile.find(params[:id])
        rubric_profile.destroy
        render head: :ok
      end
    end
  end
end
