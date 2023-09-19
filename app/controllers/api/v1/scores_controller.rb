module Api
  module V1
    class ScoresController < ApplicationController
      # TODO: Move into its own resources for Calculations
      def index
        rubric = current_profile.rubrics.find(params[:rubric_id])
        render json: rubric.calculations
      end

      def create
        rubric = current_profile.rubrics.find(params[:rubric_id])
        score = rubric.scores.create!(score_params.merge(profile_id: current_profile.id))
        render json: serialize(score)
      end

      private

      def score_params
        params.require(:score).permit(
          :name,
          :rubric_id,
          score_weights_attributes: [
            :weight_id, :value
          ]
        )
      end

      def serialize(score)
        ::V1::ScoreSerializer.new(score).serializable_hash[:data][:attributes]
      end
    end
  end
end
