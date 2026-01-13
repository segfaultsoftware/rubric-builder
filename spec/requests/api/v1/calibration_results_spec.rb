require 'rails_helper'

# rubocop:disable RSpec/MultipleExpectations, RSpec/LetSetup
RSpec.describe 'Api::V1::CalibrationResults' do
  let(:user) { create(:user) }
  let!(:profile) { create(:profile, user:) }
  let(:rubric) { create(:rubric, author: profile) }

  let(:headers) { {} }

  def auth_headers_for(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'GET /api/v1/rubrics/:rubric_id/calibration_results' do
    context 'when not authenticated' do
      it 'returns 401 unauthorized' do
        get "/api/v1/rubrics/#{rubric.id}/calibration_results.json"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated' do
      let(:headers) { auth_headers_for(user) }

      context 'when user is not a member of the rubric' do
        let(:other_user) { create(:user) }
        let(:other_profile) { create(:profile, user: other_user) }
        let(:other_rubric) { create(:rubric, author: other_profile) }

        it 'returns 404 not found' do
          get("/api/v1/rubrics/#{other_rubric.id}/calibration_results.json", headers:)

          expect(response).to have_http_status(:not_found)
        end
      end

      context 'when user is a member of the rubric' do
        let!(:weight1) { create(:weight, rubric:, name: 'Weight A') }
        let!(:weight2) { create(:weight, rubric:, name: 'Weight B') }
        let!(:weight3) { create(:weight, rubric:, name: 'Weight C') }

        context 'without profile_id parameter (defaults to current user)' do
          it 'returns calibration results for the current user' do
            get("/api/v1/rubrics/#{rubric.id}/calibration_results.json", headers:)

            expect(response).to have_http_status(:ok)

            json = response.parsed_body
            expect(json['profile']['id']).to eq(profile.id)
            expect(json['profile']['display_name']).to eq(profile.display_name)
          end

          it 'returns calibration progress with correct total' do
            get("/api/v1/rubrics/#{rubric.id}/calibration_results.json", headers:)

            json = response.parsed_body
            expect(json['calibration_progress']['total']).to eq(3)
          end

          context 'with generated pairings' do
            before do
              rubric.generate_pairings_for_profile!(profile)
            end

            it 'returns calibration progress showing all remaining' do
              get("/api/v1/rubrics/#{rubric.id}/calibration_results.json", headers:)

              json = response.parsed_body
              expect(json['calibration_progress']).to include(
                'total' => 3,
                'completed' => 0,
                'remaining' => 3
              )
            end
          end

          context 'with profile weights' do
            let!(:pw1) { create(:profile_weight, profile:, weight: weight1, value: 0.5) }
            let!(:pw2) { create(:profile_weight, profile:, weight: weight2, value: 0.3) }
            let!(:pw3) { create(:profile_weight, profile:, weight: weight3, value: 0.2) }

            it 'returns profile weights sorted by value descending' do
              get("/api/v1/rubrics/#{rubric.id}/calibration_results.json", headers:)

              json = response.parsed_body
              profile_weights = json['profile_weights']

              expect(profile_weights.length).to eq(3)
              expect(profile_weights[0]['value']).to eq(0.5)
              expect(profile_weights[1]['value']).to eq(0.3)
              expect(profile_weights[2]['value']).to eq(0.2)
            end

            it 'includes weight details in profile weights' do
              get("/api/v1/rubrics/#{rubric.id}/calibration_results.json", headers:)

              json = response.parsed_body
              first_weight = json['profile_weights'][0]['weight']

              expect(first_weight).to include(
                'id' => weight1.id,
                'name' => 'Weight A'
              )
            end
          end

          context 'with completed calibrations' do
            before do
              rubric.generate_pairings_for_profile!(profile)
              create(:calibration, rubric:, profile:, from_weight: weight1, to_weight: weight2)
              rubric.generate_pairings_for_profile!(profile)
            end

            it 'updates calibration progress correctly' do
              get("/api/v1/rubrics/#{rubric.id}/calibration_results.json", headers:)

              json = response.parsed_body
              expect(json['calibration_progress']).to include(
                'total' => 3,
                'completed' => 1,
                'remaining' => 2
              )
            end
          end
        end

        context 'with profile_id parameter' do
          let(:other_user) { create(:user) }
          let(:other_profile) { create(:profile, user: other_user, rubric:) }
          let!(:other_pw1) { create(:profile_weight, profile: other_profile, weight: weight1, value: 0.6) }
          let!(:other_pw2) { create(:profile_weight, profile: other_profile, weight: weight2, value: 0.25) }
          let!(:other_pw3) { create(:profile_weight, profile: other_profile, weight: weight3, value: 0.15) }

          it 'returns calibration results for the specified profile' do
            get("/api/v1/rubrics/#{rubric.id}/calibration_results.json",
                params: { profile_id: other_profile.id },
                headers:)

            expect(response).to have_http_status(:ok)

            json = response.parsed_body
            expect(json['profile']['id']).to eq(other_profile.id)
          end

          it 'returns profile weights for the specified profile' do
            get("/api/v1/rubrics/#{rubric.id}/calibration_results.json",
                params: { profile_id: other_profile.id },
                headers:)

            json = response.parsed_body
            profile_weights = json['profile_weights']

            expect(profile_weights.length).to eq(3)
            expect(profile_weights[0]['value']).to eq(0.6)
          end

          context 'when specified profile is not a member of the rubric' do
            let(:non_member_user) { create(:user) }
            let(:non_member_profile) { create(:profile, user: non_member_user) }

            it 'returns 404 not found' do
              get("/api/v1/rubrics/#{rubric.id}/calibration_results.json",
                  params: { profile_id: non_member_profile.id },
                  headers:)

              expect(response).to have_http_status(:not_found)
            end
          end
        end
      end
    end
  end
end
# rubocop:enable RSpec/MultipleExpectations, RSpec/LetSetup
