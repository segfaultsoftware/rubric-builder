class Profile < ApplicationRecord
  belongs_to :user

  has_many :profile_weights, dependent: :destroy
  has_many :scores, dependent: :destroy

  has_many :rubric_profiles, dependent: :destroy
  has_many :rubrics, through: :rubric_profiles

  has_many :calibrations, dependent: :destroy

  default_scope { order(id: :asc) }

  scope :with_no_pending_invites, lambda {
    joins(:user).where(users: { invitation_sent_at: nil }).or(
      joins(:user).where.not(users: { invitation_accepted_at: nil })
    )
  }

  def invite_to_rubric(email, rubric)
    invited_user = find_and_invite_user_by_email(email)
    invited_profile = invited_user.profile || invited_user.create_profile!(display_name: email)
    rubric.profiles << invited_profile unless rubric.profiles.include?(invited_profile)
    rubric.initialize_profile_weights!
  end

  def find_and_invite_user_by_email(email)
    invited_user = User.find_by(email:)
    if invited_user.present? && invited_user.invitation_sent_at.present? && invited_user.invitation_accepted_at.nil?
      invited_user.invite!(user)
    elsif invited_user.nil?
      invited_user = User.invite!({ email: }, user)
    end

    invited_user
  end
end
