module Api
  module V1
    class RubricsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:show]

      def index
        json = current_profile.rubrics.map do |rubric|
          serialize(rubric)
        end
        render json:
      end

      def show
        rubric = Rubric.find(params[:id])
        rubric = current_profile.rubrics.find(params[:id]) if rubric.members_only?
        render json: serialize(rubric)
      end

      def create
        rubric = current_profile.rubrics.create!(rubric_params.merge(author_id: current_profile.id))
        rubric.initialize_profile_weights!
        rubric.generate_all_pairings!
        render json: serialize(rubric)
      end

      def update
        rubric = current_profile.rubrics.find(params[:id])
        rubric.update(rubric_params)
        rubric.initialize_profile_weights!
        rubric.generate_all_pairings!
        render json: serialize(rubric)
      end

      def destroy
        rubric = current_profile.rubrics.find(params[:id])
        rubric.destroy
        render json: {}
      end

      private

            def rubric_params
              params.require(:rubric).permit(
                :name,
                :descriptor,
                :visibility,
                weights_attributes: [
                  :id, :name, :image_url, :_destroy
                ]
              )
            end

      def serialize(rubric)
        ::V1::RubricSerializer.new(rubric, params: { current_profile: }).serializable_hash[:data][:attributes]
      end
    end
  end
end
