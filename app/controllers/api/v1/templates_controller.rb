module Api
  module V1
    class TemplatesController < ApplicationController
      skip_before_action :authenticate_user!

      def index
        json = Rubric.where(visibility: [Rubric::TEMPLATE, Rubric::SYSTEM_TEMPLATE]).map do |rubric|
          ::V1::RubricSerializer.new(rubric, params: { current_profile: }).serializable_hash[:data][:attributes]
        end
        render json:
      end
    end
  end
end
