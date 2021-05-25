VERSION = "1.0.0" # change me to expire JS in main.js bundle

require "../config/application"

IrcChannel = Channel(Array(String)).new

require "./lib/irc"



spawn do
    client = Client.new
end

DiscordChannel = Channel(Array(String)).new

require "./lib/discord"

spawn do
    discord_client = DiscordBot.new
end




Amber::Support::ClientReload.new if Amber.settings.auto_reload?
Amber::Server.start
