require 'rails_helper'

RSpec.describe Rubric do
  describe 'validations' do
    describe 'visibility' do
      let(:rubric) { build(:rubric, author:) }

      context 'when the author is not an admin' do
        let(:author) { create(:profile) }

        it 'allows to set members_only' do
          rubric.visibility = :members_only
          expect(rubric).to be_valid
        end

        it 'allows to set template' do
          rubric.visibility = :template
          expect(rubric).to be_valid
        end

        it 'does not allow to set to system template' do
          rubric.visibility = :system_template
          expect(rubric).not_to be_valid
        end
      end

      context 'when the author is an admin' do
        let(:author) { create(:profile, is_admin: true) }

        it 'allows to set members_only' do
          rubric.visibility = :members_only
          expect(rubric).to be_valid
        end

        it 'allows to set template' do
          rubric.visibility = :template
          expect(rubric).to be_valid
        end

        it 'does not allow to set to system template' do
          rubric.visibility = :system_template
          expect(rubric).to be_valid
        end
      end
    end
  end

  describe '#generate_pairings_for_profile!' do
    let(:profile1) { create(:profile) }
    let(:profile2) { create(:profile) }

    let(:rubric) { create(:rubric, weights:, members: [profile1, profile2]) }
    let(:weights) { [weight1, weight2, weight3] }
    let(:weight1) { build(:weight) }
    let(:weight2) { build(:weight) }
    let(:weight3) { build(:weight) }

    context 'without calibrations' do
      it 'generates all pairwise combinations of existing weights' do
        rubric.generate_pairings_for_profile!(profile1)
        expected = [
          [weight1.id, weight2.id],
          [weight1.id, weight3.id],
          [weight2.id, weight3.id]
        ]
        expect(rubric.pairings_for_profile(profile1)).to match_array(expected)
      end

      context 'with only one weight' do
        let(:weights) { [weight1] }

        it 'generates an empty array' do
          rubric.generate_pairings_for_profile!(profile1)
          expect(rubric.pairings_for_profile(profile1)).to match_array([])
        end
      end
    end

    context 'with calibrations of identical iteration' do
      before do
        create(:calibration, rubric:, profile: profile1, from_weight: weight1, to_weight: weight2, iteration: 2)
        create(:calibration, rubric:, profile: profile1, from_weight: weight2, to_weight: weight1, iteration: 2)
        create(:calibration, rubric:, profile: profile1, from_weight: weight1, to_weight: weight3, iteration: 2)
        create(:calibration, rubric:, profile: profile1, from_weight: weight3, to_weight: weight1, iteration: 2)
        create(:calibration, rubric:, profile: profile1, from_weight: weight2, to_weight: weight3, iteration: 2)
        create(:calibration, rubric:, profile: profile1, from_weight: weight3, to_weight: weight2, iteration: 2)
      end

      it 'generates all pairwise combinations of existing weights' do
        rubric.generate_pairings_for_profile!(profile1)
        expected = [
          [weight1.id, weight2.id],
          [weight1.id, weight3.id],
          [weight2.id, weight3.id]
        ]
        expect(rubric.pairings_for_profile(profile1)).to match_array(expected)
      end
    end

    context 'with calibrations of varying iterations' do
      before do
        create(:calibration, rubric:, profile: profile1, from_weight: weight1, to_weight: weight2, iteration: 2)
        create(:calibration, rubric:, profile: profile1, from_weight: weight2, to_weight: weight1, iteration: 2)
        create(:calibration, rubric:, profile: profile1, from_weight: weight1, to_weight: weight3, iteration: 1)
        create(:calibration, rubric:, profile: profile1, from_weight: weight3, to_weight: weight1, iteration: 1)
        create(:calibration, rubric:, profile: profile1, from_weight: weight2, to_weight: weight3, iteration: 1)
        create(:calibration, rubric:, profile: profile1, from_weight: weight3, to_weight: weight2, iteration: 1)
      end

      it 'generates the pairwise combinations of all calibrations less than the max iteration' do
        rubric.generate_pairings_for_profile!(profile1)
        expected = [
          [weight1.id, weight3.id],
          [weight2.id, weight3.id]
        ]
        expect(rubric.pairings_for_profile(profile1)).to match_array(expected)
      end
    end

    context 'with some calibrations missing' do
      before do
        create(:calibration, rubric:, profile: profile1, from_weight: weight1, to_weight: weight3, iteration: 1)
        create(:calibration, rubric:, profile: profile1, from_weight: weight3, to_weight: weight1, iteration: 1)
        create(:calibration, rubric:, profile: profile1, from_weight: weight2, to_weight: weight3, iteration: 1)
        create(:calibration, rubric:, profile: profile1, from_weight: weight3, to_weight: weight2, iteration: 1)
      end

      it 'generates the pairwise combinations of all calibrations less than the max iteration' do
        rubric.generate_pairings_for_profile!(profile1)
        expected = [
          [weight1.id, weight2.id]
        ]
        expect(rubric.pairings_for_profile(profile1)).to match_array(expected)
      end
    end

    context 'with a neighbor' do
      it 'does not collide with neighbor' do
        rubric.generate_pairings_for_profile!(profile1)
        rubric.generate_pairings_for_profile!(profile2)

        expected = {
          profile1.id.to_s => [[weight1.id, weight2.id], [weight1.id, weight3.id], [weight2.id, weight3.id]],
          profile2.id.to_s => [[weight1.id, weight2.id], [weight1.id, weight3.id], [weight2.id, weight3.id]]
        }
        expect(rubric.computed['pairings']).to eq(expected)
      end
    end
  end

  describe '#calculations' do
    let(:score_name1) { 'Score 1' }
    let(:score_name2) { 'Score 2' }

    let(:profile1) { create(:profile) }
    let(:profile2) { create(:profile) }

    let(:weight1) { build(:weight) }
    let(:weight2) { build(:weight) }

    let(:rubric) { create(:rubric, members: [profile1, profile2], weights: [weight1, weight2]) }

    # rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations
    it 'maps calculations from scores' do
      create(:profile_weight, weight: weight1, profile: profile1, value: 0.2)
      create(:profile_weight, weight: weight2, profile: profile1, value: 0.8)
      create(:profile_weight, weight: weight1, profile: profile2, value: 0.3)
      create(:profile_weight, weight: weight2, profile: profile2, value: 0.7)

      score1_profile1_weight1 = build(:score_weight, weight: weight1, value: 5)
      score1_profile1_weight2 = build(:score_weight, weight: weight2, value: 2)
      _score1_profile1 = create(:score, rubric:, profile: profile1, name: score_name1, score_weights: [
                                  score1_profile1_weight1, score1_profile1_weight2
                                ])

      score1_profile2_weight1 = build(:score_weight, weight: weight1, value: 0)
      score1_profile2_weight2 = build(:score_weight, weight: weight2, value: 1)
      _score1_profile2 = create(:score, rubric:, profile: profile2, name: score_name1, score_weights: [
                                  score1_profile2_weight1, score1_profile2_weight2
                                ])

      score2_profile2_weight1 = build(:score_weight, weight: weight1, value: 4)
      score2_profile2_weight2 = build(:score_weight, weight: weight2, value: 3)
      _score2_profile2 = create(:score, rubric:, profile: profile2, name: score_name2, score_weights: [
                                  score2_profile2_weight1, score2_profile2_weight2
                                ])

      actual = rubric.calculations

      _expected = {
        score_name1 => {
          profile1.id => {
            -1 => 2.6,
            weight1.id => 1.0,
            weight2.id => 1.6
          },
          profile2.id => {
            -1 => 0.7,
            weight1.id => 0,
            weight2.id => 0.7
          }
        },
        score_name2 => {
          profile2.id => {
            -1 => 3.3,
            weight1.id => 1.2,
            weight2.id => 2.1
          }
        }
      }

      expect(actual.keys).to match_array([score_name1, score_name2])
      expect(actual[score_name1].keys).to match_array([profile1.id, profile2.id])
      expect(actual[score_name1][profile1.id].keys).to match_array([-1, weight1.id, weight2.id])
      expect(actual[score_name1][profile1.id][-1]).to be_within(0.01).of(2.6)
      expect(actual[score_name1][profile1.id][weight1.id]).to be_within(0.01).of(1.0)
      expect(actual[score_name1][profile1.id][weight2.id]).to be_within(0.01).of(1.6)
      expect(actual[score_name1][profile2.id].keys).to match_array([-1, weight1.id, weight2.id])
      expect(actual[score_name1][profile2.id][-1]).to be_within(0.01).of(0.7)
      expect(actual[score_name1][profile2.id][weight1.id]).to be_within(0.01).of(0.0)
      expect(actual[score_name1][profile2.id][weight2.id]).to be_within(0.01).of(0.7)

      expect(actual[score_name2].keys).to match_array([profile2.id])
      expect(actual[score_name2][profile2.id].keys).to match_array([-1, weight1.id, weight2.id])
      expect(actual[score_name2][profile2.id][-1]).to be_within(0.01).of(3.3)
      expect(actual[score_name2][profile2.id][weight1.id]).to be_within(0.01).of(1.2)
      expect(actual[score_name2][profile2.id][weight2.id]).to be_within(0.01).of(2.1)
    end
    # rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
  end

  describe '#update_profile_weights_for_profile!' do
    let(:member) { create(:profile) }
    let(:author) { rubric.author }
    let(:rubric) { create(:rubric, members: [member], weights: [weight1, weight2, weight3]) }
    let(:weight1) { create(:weight) }
    let(:weight2) { create(:weight) }
    let(:weight3) { create(:weight) }

    before do
      # make sure we're not calculating against a rogue rubric
      weight21 = build(:weight)
      weight22 = build(:weight)
      other_rubric = create(:rubric, members: [author], weights: [weight21, weight22])
      other_rubric.initialize_profile_weights!

      rubric.initialize_profile_weights!
      create(:calibration, rubric:, profile: author, from_weight: weight1, to_weight: weight2, rating: 4)
      create(:calibration, rubric:, profile: author, from_weight: weight2, to_weight: weight1, rating: 1 / 4.0)

      # These two are implicitly rating=1.0 by being absent
      # create(:calibration, rubric:, profile: author, from_weight: weight1, to_weight: weight3, rating: 1)
      # create(:calibration, rubric:, profile: author, from_weight: weight3, to_weight: weight1, rating: 1)

      create(:calibration, rubric:, profile: author, from_weight: weight2, to_weight: weight3, rating: 9)
      create(:calibration, rubric:, profile: author, from_weight: weight3, to_weight: weight2, rating: 1 / 9.0)
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

  describe '#initialize_profile_weights!' do
    let(:profile1) { create(:profile) }
    let(:profile2) { create(:profile) }
    let(:rubric) { create(:rubric, author: profile1, weights: [weight1, weight2], members: [profile1, profile2]) }
    let(:weight1) { build(:weight) }
    let(:weight2) { build(:weight) }

    it 'creates all profile_weights for all members and weights' do
      expect { rubric.initialize_profile_weights! }.to change(ProfileWeight, :count).by(4)
    end

    context 'when there already exists profile weights' do
      before do
        rubric.initialize_profile_weights!
      end

      it 'no ops' do
        expect { rubric.initialize_profile_weights! }.not_to change(ProfileWeight, :count)
      end

      context 'when a new weight is added' do
        before do
          create(:weight, rubric:)
        end

        it 'adds the missing records' do
          expect { rubric.reload.initialize_profile_weights! }.to change(ProfileWeight, :count).by(2)
        end
      end
    end
  end
end
