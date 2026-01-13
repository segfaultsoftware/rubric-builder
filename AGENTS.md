# Agent Guidelines for rubric-builder

This file contains project-specific guidelines and learnings for AI agents working on this codebase.

## Test-Driven Development (TDD)

Always use TDD when implementing features or fixing bugs. Follow these steps:

1. **Write the failing test first** - Create a test that describes the expected behavior before writing any implementation code
2. **Verify the test fails** - Run the test and confirm it fails for the expected reason (not due to syntax errors or other issues)
3. **Implement the minimal fix** - Write only the code necessary to make the test pass
4. **Verify the test passes** - Run the test again to confirm the implementation works
5. **Refactor if needed** - Clean up the code while keeping tests green

## Rails-Specific Learnings

### default_scope Can Interfere with Explicit Ordering

The `ProfileWeight` model has `default_scope { order(id: :asc) }`. When you need to override this ordering:

- **Don't use:** `.order(value: :desc)` - This gets combined with the default scope, resulting in `ORDER BY id ASC, value DESC`
- **Do use:** `.reorder(value: :desc)` - This clears existing order clauses (including from default_scope) and applies only the new ordering

This is a common Rails gotcha. Always check for default_scope when ordering queries don't work as expected.

## Testing Best Practices

### Test Data Should Not Mask Bugs

When testing sorting or ordering logic, create test data in a **non-sorted order** to properly verify the sorting works.

**Bad example** (data created in expected order - masks bugs):
```ruby
let!(:pw1) { create(:profile_weight, value: 0.5) }  # highest
let!(:pw2) { create(:profile_weight, value: 0.3) }  # middle
let!(:pw3) { create(:profile_weight, value: 0.2) }  # lowest
```

**Good example** (data created in random order - catches bugs):
```ruby
let!(:pw1) { create(:profile_weight, value: 0.15) }
let!(:pw2) { create(:profile_weight, value: 0.45) }
let!(:pw3) { create(:profile_weight, value: 0.10) }
let!(:pw4) { create(:profile_weight, value: 0.25) }
```

## UI Patterns

### Navigation Links

Pages in this app follow a pattern where they **don't render navigation links to themselves**. When adding new pages with navigation tabs, ensure the current page is not included in its own navigation links.

## Running Tests

### Test Database Migrations

If tests fail with "Migrations are pending", run:
```bash
bin/rails db:migrate RAILS_ENV=test
```

### Running All Tests

```bash
# Backend tests
bundle exec rspec

# Frontend tests (from project root, not client directory)
yarn test --watchAll=false

# Lint checks
yarn lint
```

## Heroku Deployment

### App Information

- **App name:** `rubric-builder-app`
- **Live URL:** https://rubric-builder-app-ac07bbe4f852.herokuapp.com/

### Deploying to Heroku

The default `git push heroku main` command will get stuck waiting for username/password authentication. To deploy successfully:

1. **Install Heroku CLI** (if not already installed):
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Add the Heroku remote** (if not already added):
   ```bash
   heroku git:remote -a rubric-builder-app
   ```

3. **Configure git authentication** using the API key:
   ```bash
   git remote set-url heroku "https://heroku:${HEROKU_API_KEY}@git.heroku.com/rubric-builder-app.git"
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

The deployment will automatically:
- Build the Node.js frontend (via `heroku-postbuild` script)
- Install Ruby dependencies
- Run database migrations (via the `release` command in Procfile)
