module Api
  module V1
    class RubricsController < ApplicationController
      def index
        json = Rubric.all.map do |rubric|
          serialize(rubric)
        end
        render json:
      end

      def show
        rubric = Rubric.find(params[:id])
        render json: serialize(rubric)
      end

      def create
        rubric = Rubric.create!(rubric_params)
        render json: serialize(rubric)
      end

      def update
        rubric = Rubric.find(params[:id])
        rubric.update(rubric_params)
        render json: serialize(rubric)
      end

      def destroy
        rubric = Rubric.find(params[:id])
        rubric.delete
        render json: {}
      end

      private

      def rubric_params
        params.require(:rubric).permit(
          :name,
          :author_id,
          weights_attributes: [
            :id, :name, :description, :_destroy
          ]
        )
      end

      def serialize(rubric)
        ::V1::RubricSerializer.new(rubric).serializable_hash[:data][:attributes]
      end
    end
  end
end
