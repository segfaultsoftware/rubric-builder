require 'rails_helper'

RSpec.describe Rubric do
  describe 'update_profile_weights_for_profile!' do
    let(:member) { create(:profile) }
    let(:author) { rubric.author }
    let(:rubric) { create(:rubric, members: [member], weights: [weight1, weight2, weight3]) }
    let(:weight1) { create(:weight) }
    let(:weight2) { create(:weight) }
    let(:weight3) { create(:weight) }

    before do
      rubric.initialize_profile_weights!
      create(:calibration, rubric:, profile: author, from_weight: weight1, to_weight: weight2, rating: 4)
      create(:calibration, rubric:, profile: author, from_weight: weight1, to_weight: weight3, rating: 1)
      create(:calibration, rubric:, profile: author, from_weight: weight2, to_weight: weight3, rating: 9)
    end

    it 'does not affect other user score weights' do
      rubric.update_profile_weights_for_profile!(author)

      profile_weight_values = member.profile_weights.map(&:value).uniq
      expect(profile_weight_values).to eq([1.0])
    end

    # rubocop:disable RSpec/MultipleExpectations
    it 'recalculates and updates all score weights for a user' do
      rubric.update_profile_weights_for_profile!(author)

      expect(author.profile_weights.find_by(weight_id: weight1.id).value).to be_within(0.0000001).of(0.4393207437)
      expect(author.profile_weights.find_by(weight_id: weight2.id).value).to be_within(0.0000001).of(0.3749817011)
      expect(author.profile_weights.find_by(weight_id: weight3.id).value).to be_within(0.0000001).of(0.1856975553)
    end
    # rubocop:enable RSpec/MultipleExpectations
  end

  describe '#remove_member' do
    let(:rubric) { create(:rubric, members: [member]) }
    let(:author) { rubric.author }
    let(:member) { create(:profile) }
    let(:non_member) { create(:profile) }

    context 'when profile_id is not currently a member' do
      it 'quietly no-ops' do
        rubric.remove_member(non_member)
        expect(rubric.reload.profiles.map(&:display_name)).to match_array([author.display_name, member.display_name])
      end
    end

    context 'when profile_id is the author' do
      it 'raises' do
        expect { rubric.remove_member(author) }.to raise_error(Rubric::CannotRemoveAuthorFromRubricError)
      end

      it 'does not remove the author' do
        rubric.remove_member(author)
      rescue Rubric::CannotRemoveAuthorFromRubricError
        expect(rubric.reload.profiles.map(&:display_name)).to match_array([author.display_name, member.display_name])
      end
    end

    context 'when profile_id is a non-author member' do
      it 'removes the member from the rubric' do
        rubric.remove_member(member)
        expect(rubric.reload.profiles.map(&:display_name)).to match_array([author.display_name])
      end
    end
  end
end
