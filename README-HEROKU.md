Heroku deployment

1. Set environment variables in Heroku config:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE (service role key)
   - ADMIN_SECRET (your admin secret for the admin server)

2. Deploy the repo to Heroku (git push heroku main). The `heroku-postbuild` script will run `npm run build` and the Express server will serve the static `dist` files.

3. Make sure to NOT commit the service role key into source control. Use Heroku config vars instead.
