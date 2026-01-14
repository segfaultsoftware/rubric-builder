# Helper module for counting database queries in tests
module QueryCounter
  def count_queries(&)
    queries = []
    counter = ->(*, payload) { queries << payload[:sql] unless payload[:name] == 'SCHEMA' }
    ActiveSupport::Notifications.subscribed(counter, 'sql.active_record', &)
    queries
  end

  def count_queries_matching(pattern, &)
    queries = count_queries(&)
    queries.count { |sql| sql.match?(pattern) }
  end
end

RSpec.configure do |config|
  config.include QueryCounter
end
