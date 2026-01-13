module Api
  module V1
    class CalibrationResultsController < ApplicationController
      rescue_from ActiveRecord::RecordNotFound, with: :not_found

      def index
        render json: {
          profile: serialize_profile(target_profile),
          calibration_progress:,
          profile_weights: sorted_profile_weights
        }
      end

      private

      def not_found
        render json: { error: 'Not found' }, status: :not_found
      end

      def rubric
        @rubric ||= current_profile.rubrics.find(params[:rubric_id])
      end

      def target_profile
        @target_profile ||= if params[:profile_id].present?
                              rubric.profiles.find(params[:profile_id])
                            else
                              current_profile
                            end
      end

      def calibration_progress
        total_pairings = rubric.weights.count * (rubric.weights.count - 1) / 2
        remaining_pairings = rubric.pairings_for_profile(target_profile).length
        completed_pairings = total_pairings - remaining_pairings

        {
          total: total_pairings,
          completed: completed_pairings,
          remaining: remaining_pairings
        }
      end

      def sorted_profile_weights
        profile_weights_query.map { |pw| serialize_profile_weight(pw) }
      end

      def profile_weights_query
        ProfileWeight
          .joins(:weight)
          .where(profile: target_profile, weight: { rubric_id: rubric.id })
          .reorder(value: :desc)
      end

      def serialize_profile_weight(profile_weight)
        {
          id: profile_weight.id,
          value: profile_weight.value,
          profile_id: profile_weight.profile_id,
          weight_id: profile_weight.weight_id,
          weight: serialize_weight(profile_weight.weight)
        }
      end

      def serialize_weight(weight)
        { id: weight.id, name: weight.name, image_url: weight.image_url }
      end

      def serialize_profile(profile)
        result = ::V1::ProfileSerializer.new(profile).serializable_hash
        result[:data]&.dig(:attributes)
      end
    end
  end
end
