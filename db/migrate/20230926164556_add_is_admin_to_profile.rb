class AddIsAdminToProfile < ActiveRecord::Migration[7.0]
  def up
    add_column :profiles, :is_admin, :boolean, default: false, null: false
    execute "update profiles set is_admin = true where display_name = 'samuel.j.serrano@gmail.com'"
  end

  def down
    remove_column :profiles, :is_admin
  end
end
