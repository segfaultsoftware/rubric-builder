module Api
  module V1
    class CalibrationsController < ApplicationController
      def show
        json = rubric.calibrations.where(profile_id: current_profile.id).map do |calibration|
          ::V1::CalibrationSerializer.new(calibration).serializable_hash[:data][:attributes]
        end
        render json:
      end

      # rubocop:disable Metrics/AbcSize
      def update
        calibration, inverse = Calibration.update_rating(rubric:, profile:, from_weight:, to_weight:, rating:)

        if calibration.errors.empty? && inverse.errors.empty?
          # TODO: delayed job
          rubric.update_profile_weights_for_profile!(current_profile)
          rubric.generate_all_pairings!
          render head: :ok
        else
          render status: :unprocessable_entity, json: {
            errors: calibration.errors.full_messages + inverse.errors.full_messages
          }
        end
      end
      # rubocop:enable Metrics/AbcSize

      private

      def rubric
        current_profile.rubrics.find(params[:rubric_id])
      end

      def profile
        current_profile
      end

      def from_weight
        rubric.weights.find(params[:from_weight_id])
      end

      def to_weight
        rubric.weights.find(params[:to_weight_id])
      end

      def rating
        params[:rating]
      end
    end
  end
end
