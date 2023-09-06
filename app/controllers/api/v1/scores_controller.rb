module Api
  module V1
    class ScoresController < ApplicationController
      def index
        rubric = Rubric.find(params[:rubric_id])
        render json: rubric.scores.map { |score| serialize(score) }
      end

      def create
        score = Score.create!(score_params)
        render json: serialize(score)
      end

      private

      def score_params
        params.require(:score).permit(
          :name,
          :profile_id,
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
