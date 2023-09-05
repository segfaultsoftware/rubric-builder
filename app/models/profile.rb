class Profile < ApplicationRecord
  default_scope { order(id: :asc) }
end
