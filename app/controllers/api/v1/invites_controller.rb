module Api
  module V1
    class InvitesController < ApplicationController
      def create
        current_profile.invite_to_rubric(params[:email], rubric)
        render head: :created
      end

      private

      def rubric
        current_profile.rubrics.find(params[:rubric_id])
      end
    end
  end
end
