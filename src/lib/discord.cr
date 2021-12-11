require "discordcr"

# Make sure to replace this fake data with actual data when running.


class DiscordBot


    def initialize(discord_token, discord_client_id)

        @discord_client = Discord::Client.new(token: "Bot #{discord_token}", client_id: discord_client_id)

        @discord_client.on_message_create do |payload|
            message = payload.content
            name = payload.author.username

            if name.includes?("openloft-bridge") || name.includes?("OpenLoft Bridge Bot") || name.includes?("openloft-bridge-dev")
                next
            end
            name = "#{name}@discord"
        
            puts "#{name} said #{message}"
            # Sanitizer = Sanitize::Policy::HTMLSanitizer.basic
            name = Sanitizer.process(name.to_s)
            message = Sanitizer.process(message.to_s)
            # message = " [#{Time.utc.month}/#{Time.utc.day}/#{Time.utc.year} #{Time.utc.hour}:#{Time.utc.minute}:#{Time.utc.second}] #{message}"
            redis = REDIS
            redis.rpush "chats_gbalda", {name: name, chat_message: message, room: nil}.to_h.to_json
            # if redis.ttl("chats") == -1
            #   redis.expire("chats", 7 * 24 * 3600)
            # end
            ChatSocket.broadcast("message", "chat:gbalda", "message_new", {name: name, chat_message: message}.to_h)
            IrcChannel.send([name, message])
        end

        spawn do
            while true
                Fiber.yield
                message = DiscordChannel.receive

                puts "message #{message}"

                name = message.first

                chat = message.last

                say("650125742918729750", "#{name} -> #{chat}")
            end
        end

        @discord_client.run

    end


    def discord_client
        @discord_client
    end

    def say(channel_id, msg)
        discord_client.create_message channel_id.to_u64, msg
    end


end
