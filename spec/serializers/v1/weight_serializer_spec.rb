require 'rails_helper'

RSpec.describe V1::WeightSerializer do
  describe '#image_url' do
    it 'includes image_url in serialized output' do
      current_profile = create(:profile)
      weight = create(:weight, image_url: 'https://example.com/image.jpg')

      json = V1::WeightSerializer.new(weight, params: { current_profile: }).serializable_hash[:data][:attributes]

      expect(json[:image_url]).to eq('https://example.com/image.jpg')
    end

    it 'returns nil when image_url is not set' do
      current_profile = create(:profile)
      weight = create(:weight, image_url: nil)

      json = V1::WeightSerializer.new(weight, params: { current_profile: }).serializable_hash[:data][:attributes]

      expect(json[:image_url]).to be_nil
    end
  end
end
