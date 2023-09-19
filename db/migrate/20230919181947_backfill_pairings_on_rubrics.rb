class BackfillPairingsOnRubrics < ActiveRecord::Migration[7.0]
  def up
    rubric_class = Object.const_get('Rubric')
    rubric_class.all.each do |rubric|
      rubric.generate_all_pairings!
    end
  rescue NameError
    Rails.logger.warn("Class Rubric no longer exists, so skipping this migration #{self.class.name}")
  end

  def down
    # no op
  end
end
