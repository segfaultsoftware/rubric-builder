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

    # rubocop:disable Layout/LineLength
    it { is_expected.to validate_numericality_of(:rating).is_greater_than_or_equal_to(0.11111).is_less_than_or_equal_to(9) }
    # rubocop:enable Layout/LineLength

    it { is_expected.to validate_numericality_of(:iteration).is_greater_than_or_equal_to(1) }
  end

  describe '.update_rating' do
    let(:rating) { 4.0 }

    def update_rating
      Calibration.update_rating(rubric:, profile:, from_weight:, to_weight:, rating:)
    end

    context 'when the calibration does note exist yet' do
      it 'creates two new records' do
        expect { update_rating }.to change(Calibration, :count).by(2)
      end

      it 'returns the new records' do
        expect(update_rating.length).to eq(2)
      end

      describe 'the first record' do
        let(:new_record) { update_rating.first }

        it 'saves the rating' do
          expect(new_record.rating).to eq(rating)
        end

        it 'saves the iteration' do
          expect(new_record.iteration).to eq(1)
        end
      end

      describe 'the second record' do
        let(:new_record) { update_rating.last }

        it 'saves the inverse rating' do
          expect(new_record.rating).to eq(1.0 / rating)
        end

        it 'saves the iteration' do
          expect(new_record.iteration).to eq(1)
        end
      end
    end

    context 'when the calibration already exists' do
      before do
        create(:calibration, rubric:, profile:, from_weight:, to_weight:, rating: 2)
        create(:calibration, rubric:, profile:, from_weight: to_weight, to_weight: from_weight, rating: 1.0 / 2)
      end

      it 'does not create a new record' do
        expect { update_rating }.not_to change(Calibration, :count)
      end

      it 'returns the updated records' do
        expect(update_rating.length).to eq(2)
      end

      describe 'the first updated record' do
        let(:updated_record) { update_rating.first }

        it 'updates the rating' do
          expect(updated_record.rating).to eq(4.0)
        end

        it 'increments the iteration' do
          expect(updated_record.iteration).to eq(2)
        end
      end

      describe 'the second updated record' do
        let(:updated_record) { update_rating.last }

        it 'updates the rating' do
          expect(updated_record.rating).to eq(1 / 4.0)
        end

        it 'increments the iteration' do
          expect(updated_record.iteration).to eq(2)
        end
      end
    end
  end
end
