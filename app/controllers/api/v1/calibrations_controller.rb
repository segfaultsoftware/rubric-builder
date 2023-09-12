module Api
  module V1
    class CalibrationsController < ApplicationController
      def update
        calibrations = params[:calibrations]
        ProfileWeight.update_calibrations!(calibrations, current_profile)

        render head: :ok
      end
    end
  end
end
