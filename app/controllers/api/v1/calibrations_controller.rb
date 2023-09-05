module Api
  module V1
    class CalibrationsController < ApplicationController
      def update
        calibrations = params[:calibrations]
        ProfileWeight.update_calibrations!(calibrations)

        render head: :ok
      end

      private

      def rubric_id
        params[:rubric_id]
      end

      def rubric
        Rubric.find(rubric_id)
      end
    end
  end
end
