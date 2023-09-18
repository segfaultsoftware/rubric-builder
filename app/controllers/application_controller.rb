class ApplicationController < ActionController::API
  respond_to :json
  include ActionController::MimeResponds

  before_action :authenticate_user!, except: [:fallback_index_html]

  def fallback_index_html
    render file: 'public/index.html'
  end

  private

  def current_profile
    current_user.profile
  end
end
