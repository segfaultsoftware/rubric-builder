module Api::V1
  class RubricsController < ApplicationController
    def index
      render json: Rubric.all
    end

    def create
      rubric = Rubric.create!(rubric_params)
      render json: rubric
    end

    def show
      rubric = Rubric.find(params[:id])
      render json: rubric
    end

    def update
      rubric = Rubric.find(params[:id])
      rubric.update(rubric_params)
      render json: rubric
    end

    private

    def rubric_params
      params.require(:rubric).permit(:name, :author_id)
    end
  end
end

