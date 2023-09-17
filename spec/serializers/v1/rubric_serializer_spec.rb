require 'rails_helper'

RSpec.describe V1::RubricSerializer do
  describe '#members' do
    it 'only includes members who were self-sign-up or accepted invitation' do
      self_sign_up_profile = create(:profile)
      invited_user = create(:user, invitation_sent_at: DateTime.now)
      invited_profile = create(:profile, user: invited_user)
      accepted_user = create(:user, invitation_sent_at: DateTime.now, invitation_accepted_at: DateTime.now)
      accepted_profile = create(:profile, user: accepted_user)

      rubric = create(:rubric, author: self_sign_up_profile, members: [invited_profile, accepted_profile])

      json = V1::RubricSerializer.new(rubric).serializable_hash[:data][:attributes]

      actual_display_names = json[:members].pluck(:display_name)
      expected_display_names = [self_sign_up_profile.display_name, accepted_profile.display_name]
      expect(actual_display_names).to match_array(expected_display_names)
    end
  end
end
