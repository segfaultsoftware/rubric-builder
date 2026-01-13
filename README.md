# README

Visit Me! http://rubric-me.com

Tracking in github now: https://github.com/orgs/segfaultsoftware/projects/1/views/1

## Emails in Local Dev
1. `brew install openssl`
2. `gem install eventmachine -- --with-openssl-dir=$(brew --prefix openssl)`
3. `gem install mailcatcher -- --with-ldflags="-Wl,-undefined,dynamic_lookup"`
4. Run `mailcatcher -f` (it's also in the Procfile.dev)
5. Visit http://127.0.0.1:1080/

## Bulk Weight Import

You can bulk import weights into a rubric by uploading a JSON file on the rubric edit page. Click the "Import Weights" button and select a JSON file with the following format:

```json
[
  {"name": "Weight 1", "imageUrl": "https://example.com/image1.png"},
  {"name": "Weight 2"},
  {"name": "Weight 3", "imageUrl": "https://example.com/image3.jpg"}
]
```

Each weight object must have a `name` field (required). The `imageUrl` field is optional and must be a valid HTTP or HTTPS URL. Uploading a file will replace all existing weights in the form. Changes are not saved until you click "Save Rubric".

## Production

Hosted via Heroku and Cloudflare for DNS. SSL certs should be automatically managed
by Heroku. To deploy, `git push heroku main`

## Credits

Reference project: https://github.com/utricularian/the-recipe-spreadsheet <br/>
...which follows: https://bennierobinson.com/programming/2020/12/01/react-rails-setup.html <br/>
...for authentication: https://dakotaleemartinez.com/tutorials/devise-jwt-api-only-mode-for-authentication/
