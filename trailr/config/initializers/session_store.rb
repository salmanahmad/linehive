# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_trailr_session',
  :secret      => '72a5f31e3e818932b369eab9a769ef75f75482948233a7af635630928a6df63356d9ec20c3950fe48c7e5185ab24e311f93b7f99ed5bfb257bd235e49fa4973d'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
