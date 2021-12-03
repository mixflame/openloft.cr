VERSION = "1.0.0" # change me to expire JS in main.js bundle

require "../config/application"

# ping openloft.org
require "http/client"

puts "Pinging openloft.org..."
response = HTTP::Client.get "http://www.openloft.org/ping"
#response.status_code      # => 200
#response.body.lines.first # => "<!doctype html>"

Amber::Support::ClientReload.new if Amber.settings.auto_reload?
Amber::Server.start