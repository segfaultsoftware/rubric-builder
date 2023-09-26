# README

Visit Me! http://rubric-me.com

Tracking in github now: https://github.com/orgs/segfaultsoftware/projects/1/views/1

## Emails in Local Dev
1. `brew install openssl`
2. `gem install eventmachine -- --with-openssl-dir=$(brew --prefix openssl)`
3. `gem install mailcatcher -- --with-ldflags="-Wl,-undefined,dynamic_lookup"`
4. Run `mailcatcher -f` (it's also in the Procfile.dev)
5. Visit http://127.0.0.1:1080/

## Production

Hosted via Heroku and Cloudflare for DNS. SSL certs should be automatically managed
by Heroku. To deploy, `git push heroku main`

## Credits

Reference project: https://github.com/utricularian/the-recipe-spreadsheet <br/>
...which follows: https://bennierobinson.com/programming/2020/12/01/react-rails-setup.html <br/>
...for authentication: https://dakotaleemartinez.com/tutorials/devise-jwt-api-only-mode-for-authentication/
