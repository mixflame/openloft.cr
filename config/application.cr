# About Application.cr File
#
# This is Amber application main entry point. This file is responsible for loading
# initializers, classes, and all application related code in order to have
# Amber::Server boot up.
#
# > We recommend not modifying the order of the requires since the order will
# affect the behavior of the application.

require "amber"
require "./settings"
require "./logger"
require "./i18n"
require "./database"
require "./initializers/**"

# uncomment these 4 lines to enable plugins
# require "../plugins/plugins"

# Start Generator Dependencies: Don't modify.
require "../src/sockets/**"
require "../src/channels/**"
# End Generator Dependencies

require "../src/controllers/application_controller"
require "../src/controllers/**"
require "./routes"

INLINE_SAFELIST = {"a" => Set {"href", "hreflang", "target"}, 
"abbr" => Set(String).new, 
"acronym" => Set(String).new, 
"b" => Set(String).new, 
"code" => Set(String).new, 
"em" => Set(String).new, 
"i" => Set(String).new, 
"strong" => Set(String).new,
"font" => Set(String).new, 
"*" => Set {"dir", "lang", "title", "class", "color"}}

Policy = INLINE_SAFELIST.merge({
"blockquote" => Set {"cite"}, 
"br" => Set(String).new, 
"h1" => Set(String).new, 
"h2" => Set(String).new, 
"h3" => Set(String).new, 
"h4" => Set(String).new, 
"h5" => Set(String).new, 
"h6" => Set(String).new, 
"hr" => Set(String).new, 
"img" => Set {"alt", "src", "longdesc", "width", "height", "align"}, 
"li" => Set(String).new, 
"ol" => Set {"start"}, 
"p" => Set {"align"}, 
"pre" => Set(String).new, 
"ul" => Set(String).new})

class HTTP::Server

  private def handle_exception(e : Exception)
    # TODO: This needs more refinement. Not every exception is an actual server
    # error and should be logged as such. Client malfunction should only be informational.
    # See https://github.com/crystal-lang/crystal/pull/9034#discussion_r407038999
    Log.error(exception: e) { "Error while connecting a new socket: #{e.message}" }
  end

end

#Amber::Server.pubsub_adapter = Amber::WebSockets::Adapters::RedisAdapter

# # hack

# puts "using #{Amber::Server.pubsub_adapter}"

REDIS = Redis.new("127.0.0.1", 6379)

Sanitizer = Sanitize::Policy::Whitelist.new(Policy)

# IrcChannel = Channel(Array(String)).new

# require "../src/lib/irc"

# spawn do
#   client = Client.new
# end

# DiscordChannel = Channel(Array(String)).new

# require "../src/lib/discord"

# spawn do
#   discord_client = DiscordBot.new
# end

