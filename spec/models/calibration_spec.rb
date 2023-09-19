require 'rails_helper'

RSpec.describe Calibration do
  subject(:calibration) { build(:calibration, rubric:, profile:, from_weight:, to_weight:) }

  let(:profile) { rubric.author }
  let(:rubric) { create(:rubric) }
  let(:from_weight) { create(:weight, rubric:) }
  let(:to_weight) { create(:weight, rubric:) }

  describe 'validations' do
    it 'has a valid factory default' do
      expect(build(:calibration)).to be_valid
    end

    it 'ensures profile belongs to rubric' do
      calibration.profile = create(:profile)
      expect(calibration).not_to be_valid
    end

    it 'ensures from_weight belongs to rubric' do
      calibration.from_weight = create(:weight)
      expect(calibration).not_to be_valid
    end

    it 'ensures to_weight belongs to rubric' do
      calibration.to_weight = create(:weight)
      expect(calibration).not_to be_valid
    end

    it 'ensures the weights are different' do
      calibration.to_weight = calibration.from_weight
      expect(calibration).not_to be_valid
    end

    it { is_expected.to validate_numericality_of(:rating).is_greater_than_or_equal_to(1).is_less_than_or_equal_to(9) }
    it { is_expected.to validate_numericality_of(:iteration).is_greater_than_or_equal_to(1) }
  end

  describe '.update_rating' do
    let(:rating) { 4.0 }

    def update_rating
      Calibration.update_rating(rubric:, profile:, from_weight:, to_weight:, rating:)
    end

    context 'when the calibration does note exist yet' do
      it 'creates a new record' do
        expect { update_rating }.to change(Calibration, :count).by(1)
      end

      it 'returns the new record' do
        expect(update_rating).to be_a(Calibration)
      end

      describe 'the new record' do
        let(:new_record) { update_rating }

        it 'saves the rating' do
          expect(new_record.rating).to eq(rating)
        end

        it 'saves the iteration' do
          expect(new_record.iteration).to eq(1)
        end
      end
    end

    context 'when the rating is < 1.0' do
      let(:rating) { 0.25 }

      it 'creates a new record' do
        expect { update_rating }.to change(Calibration, :count).by(1)
      end

      it 'returns the new record' do
        expect(update_rating).to be_a(Calibration)
      end

      describe 'the new record' do
        let(:new_record) { update_rating }

        it 'saves the rating' do
          expect(new_record.rating).to eq(4.0)
        end

        it 'saves the iteration' do
          expect(new_record.iteration).to eq(1)
        end
      end
    end

    context 'when the calibration already exists' do
      before do
        create(:calibration, rubric:, profile:, from_weight:, to_weight:, rating: 2)
      end

      it 'does not create a new record' do
        expect { update_rating }.not_to change(Calibration, :count)
      end

      it 'returns the updated record' do
        expect(update_rating).to be_valid
      end

      describe 'the updated record' do
        it 'updates the rating' do
          expect { update_rating }.to change { Calibration.last.rating }.from(2).to(4.0)
        end

        it 'increments the iteration' do
          expect { update_rating }.to change { Calibration.last.iteration }.from(1).to(2)
        end
      end
    end
  end
end
