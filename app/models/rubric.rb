class Rubric < ApplicationRecord
  belongs_to :author, class_name: 'Profile'

end
