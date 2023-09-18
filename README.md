# README

Visit Me! http://rubric-me.com

Reference project: https://github.com/utricularian/the-recipe-spreadsheet
Which follows: https://bennierobinson.com/programming/2020/12/01/react-rails-setup.html
For authentication: https://dakotaleemartinez.com/tutorials/devise-jwt-api-only-mode-for-authentication/

## Emails in Local Dev
1. `brew install openssl`
2. `gem install eventmachine -- --with-openssl-dir=$(brew --prefix openssl)`
3. `gem install mailcatcher -- --with-ldflags="-Wl,-undefined,dynamic_lookup"`
4. Run `mailcatcher -f` (it's also in the Procfile.dev)
5. Visit http://127.0.0.1:1080/

## Production

Hosted via Heroku and Cloudflare for DNS. SSL certs should be automatically managed
by Heroku. To deploy, `git push heroku main`

## Feature TODOs
1. ~~Finish styling with Bootstrap~~
2. ~~Invite by email directly to a Rubric~~
3. Make mobile friendly
4. Decision making algorithm to better calibration
5. Noun shuffling refactor (the words I use make a statistician cringe)
