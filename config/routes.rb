Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root "api/v1/rubrics#index"

  devise_for :users, path: '', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    registration: 'signup'
  },
  controllers: {
    invitations: 'users/invitations',
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }
  get 'current_user', to: 'current_user#index'

  namespace :api do
    namespace :v1 do
      resource :browser_subscription, only: [:show, :update]
      resources :invites, only: [:create]

      resources :templates, only: [:index]
      resources :rubrics, only: [:index, :create, :show, :update, :destroy] do
        resources :profiles, only: [:destroy]
        resources :scores, only: [:index, :create]

        resource :calibrations, only: [:show, :update]
      end
    end
  end

  get '*path', to: 'static_pages#fallback_index_html', constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
