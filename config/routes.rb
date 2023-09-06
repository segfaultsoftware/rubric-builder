Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"

  namespace :api do
    namespace :v1 do
      resources :profiles, only: [:index, :create]
      resources :rubrics, only: [:index, :create, :show, :update, :destroy] do
        resources :profiles, only: [:destroy]
        resources :scores, only: [:create]

        resource :calibrations, only: [:update]
      end
      resources :rubric_profiles, only: [:create]
    end
  end
end
