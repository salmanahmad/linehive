# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_install_session',
  :secret      => '47a046d16e19ace5c5fb734bc8d8417ca2f8b2a530d5819c5f4a1f71f25dda8570fbb5a8dace6b7db8aafec9a5d1a9a97d98142bb3ab1a33c4b8ab5932fed5fa'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
