module Api
  module V1
    class InvitesController < ApplicationController
      def create
        rubric.present? ? current_profile.invite_to_rubric(email, rubric) : current_profile.invite_to_platform(email)
        render head: :created
      end

      private

      def email
        params[:email]
      end

      def rubric
        params[:rubric_id].present? ? current_profile.rubrics.find(params[:rubric_id]) : nil
      end
    end
  end
end
