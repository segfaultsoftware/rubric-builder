module Api
  module V1
    class InvitesController < ApplicationController
      def create
        user = User.find_by!(email: params[:email])
        rubric.profiles << user.profile
        rubric.initialize_profile_weights!
        render head: :created
      end

      private

      def rubric
        current_profile.rubrics.find(params[:rubric_id])
      end
    end
  end
end
