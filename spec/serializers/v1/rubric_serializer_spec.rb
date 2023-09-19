require 'rails_helper'

RSpec.describe V1::RubricSerializer do
  describe '#weights' do
    it 'only includes profile weights of the current user' do
      current_profile = create(:profile)
      other_profile = create(:profile)

      weight1 = build(:weight)
      weight2 = build(:weight)

      rubric = create(:rubric, members: [current_profile, other_profile], weights: [weight1, weight2])
      rubric.initialize_profile_weights!

      json = V1::RubricSerializer.new(rubric, params: { current_profile: }).serializable_hash[:data][:attributes]

      profile_ids = json[:weights].pluck(:profile_weights).flatten.pluck(:profile_id).uniq
      expect(profile_ids).to eq([current_profile.id])
    end
  end

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
