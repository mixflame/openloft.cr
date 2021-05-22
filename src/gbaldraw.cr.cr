VERSION = "1.0.0" # change me to expire JS in main.js bundle

require "../config/application"

Amber::Support::ClientReload.new if Amber.settings.auto_reload?
Amber::Server.start
