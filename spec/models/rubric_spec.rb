require 'rails_helper'

RSpec.describe Rubric do
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
