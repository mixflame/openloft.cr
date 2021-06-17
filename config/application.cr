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

# Amber::Server.instance.pubsub_adapter = Amber::WebSockets::Adapters::RedisAdapter

REDIS = Redis.new

Sanitizer = Sanitize::Policy::Whitelist.new(Policy)

IrcChannel = Channel(Array(String)).new

require "../src/lib/irc"

spawn do
  client = Client.new
end

DiscordChannel = Channel(Array(String)).new

require "../src/lib/discord"

spawn do
  discord_client = DiscordBot.new
end

