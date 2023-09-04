module Api::V1
  class ProfilesController < ApplicationController
    def create
      render json: Profile.create!(profile_params)
    end

    private

    def profile_params
      params.require(:profile).permit(:display_name)
    end
  end
end
