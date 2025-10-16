Heroku deployment

1. Set environment variables in Heroku config:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE (service role key) — required by the admin server to perform privileged deletes
   - ADMIN_EMAILS (comma-separated list of admin emails) or ADMIN_SECRET for backward compatibility
     - Example: ADMIN_EMAILS=tmaadda@gmail.com,other@you.com

2. Deploy the repo to Heroku (git push heroku main). The `heroku-postbuild` script will run `npm run build` and the Express server (started via the `Procfile`) will serve the static `dist` files.

3. Make sure to NOT commit the service role key into source control. Use Heroku config vars instead.

Soft-delete behavior
--------------------
- The admin server now performs a soft-delete by default: when an admin deletes a video the server will mark the row with `deleted = true`, set `deleted_at`, and record `deleted_by` (admin email).
- To permanently remove storage objects and delete the DB row, set the `PERMANENT_DELETE=true` env var in your runtime environment.
- A SQL migration file is included at `migrations/001_add_soft_delete.sql` which adds `deleted`, `deleted_at`, and `deleted_by` columns to your `videos` table.
