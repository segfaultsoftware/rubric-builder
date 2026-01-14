require 'rails_helper'

RSpec.describe Profile do
  include ActiveJob::TestHelper

  describe 'scopes' do
    describe '#with_no_pending_invites' do
      it 'only returns users that have either accepted invites or never had an invite' do
        self_sign_up_profile = create(:profile)
        invited_user = create(:user, invitation_sent_at: DateTime.now)
        _invited_profile = create(:profile, user: invited_user)
        accepted_user = create(:user, invitation_sent_at: DateTime.now, invitation_accepted_at: DateTime.now)
        accepted_profile = create(:profile, user: accepted_user)

        expect(described_class.all.with_no_pending_invites).to match_array([self_sign_up_profile, accepted_profile])
      end
    end
  end

  describe '#invite_to_rubric' do
    let(:email) { 'foo@bar.baz' }
    let!(:inviter_profile) { create(:profile) }
    let!(:rubric) { create(:rubric, author: inviter_profile) }

    let(:invite) { inviter_profile.invite_to_rubric(email, rubric) }

    context 'when the target email does not exist as a user yet' do
      it 'creates a user' do
        invite

        new_user = User.last
        expect(new_user.email).to eq(email)
      end

      it 'creates a profile' do
        invite

        new_user = User.last
        profile = new_user.profile
        expect(profile.display_name).to eq(email)
      end

      it 'sends an invite' do
        invite

        mail = ActionMailer::Base.deliveries.last
        expect(mail.to).to eq([email])
      end

      it 'adds the profile to the rubric' do
        invite

        expect(rubric.reload.profiles.map(&:display_name)).to match_array([email, inviter_profile.display_name])
      end
    end

    context 'when the target email exists as a user' do
      let!(:target_user) { create(:user, email:, invitation_sent_at:, invitation_accepted_at:) }
      let!(:target_profile) { create(:profile, user: target_user, display_name: email) }

      context 'with an unaccepted invite' do
        let(:invitation_sent_at) { DateTime.now }
        let(:invitation_accepted_at) { nil }

        it 'does not create a new User' do
          expect { invite }.not_to change(User, :count)
        end

        it 'reinvites them' do
          expect { invite }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end

        it 'adds them to the rubric' do
          invite

          expect(rubric.reload.profiles.map(&:display_name)).to match_array([email, inviter_profile.display_name])
        end

        context 'when the user was already part of the rubric' do
          before do
            rubric.profiles << target_profile
          end

          it 'does not crash' do
            expect { invite }.not_to change { rubric.reload.profiles.map(&:display_name) }
          end
        end
      end

      context 'with an accepted invite' do
        let(:invitation_sent_at) { DateTime.now }
        let(:invitation_accepted_at) { DateTime.now }

        it 'does not create a new User' do
          expect { invite }.not_to change(User, :count)
        end

        it 'does not reinvite them' do
          expect { invite }.not_to change { ActionMailer::Base.deliveries.count }
        end

        it 'adds them to the rubric' do
          invite

          expect(rubric.reload.profiles.map(&:display_name)).to match_array([email, inviter_profile.display_name])
        end

        context 'when the user was already part of the rubric' do
          before do
            rubric.profiles << target_profile
          end

          it 'does not crash' do
            expect { invite }.not_to change { rubric.reload.profiles.map(&:display_name) }
          end
        end
      end

      context 'with a self-sign-up' do
        let(:invitation_sent_at) { nil }
        let(:invitation_accepted_at) { nil }

        it 'does not create a new User' do
          expect { invite }.not_to change(User, :count)
        end

        it 'does not invite them' do
          expect { invite }.not_to change { ActionMailer::Base.deliveries.count }
        end

        it 'adds them to the rubric' do
          invite

          expect(rubric.reload.profiles.map(&:display_name)).to match_array([email, inviter_profile.display_name])
        end

        it 'generates pairings for the invited profile' do
          create(:weight, rubric:)
          create(:weight, rubric:)

          invite

          expect(rubric.reload.pairings_for_profile(target_profile)).not_to be_empty
        end

        context 'when the user was already part of the rubric' do
          before do
            rubric.profiles << target_profile
          end

          it 'does not crash' do
            expect { invite }.not_to change { rubric.reload.profiles.map(&:display_name) }
          end
        end
      end
    end
  end
end
