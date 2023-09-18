class ApplicationController < ActionController::API
  respond_to :json
  include ActionController::MimeResponds

  before_action :authenticate_user!

  private

  def current_profile
    current_user.profile
  end
end
