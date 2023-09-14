Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "api/v1/rubrics#index"

  devise_for :users, path: '', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    registration: 'signup'
  },
  controllers: {
   sessions: 'users/sessions',
   registrations: 'users/registrations'
  }
  get 'current_user', to: 'current_user#index'

  namespace :api do
    namespace :v1 do
      resources :rubrics, only: [:index, :create, :show, :update, :destroy] do
        resources :invites, only: [:create]
        resources :profiles, only: [:destroy]
        resources :scores, only: [:index, :create]

        resource :calibrations, only: [:update]
      end
    end
  end
end
