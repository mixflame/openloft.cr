class ChatChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
    puts "chat joined"
  end

  def handle_message(client_socket, message)
    puts "data sent to chat channel"
    puts message
    data = message.as_h["payload"].as_h
    msg = message.as_h
    room = data["room"].to_s rescue ""
    sanitizer = Sanitize::Policy::HTMLSanitizer.basic
    if(!data["name"].nil? && !data["chat_message"].nil?)
      data["name"] = JSON::Any.new(sanitizer.process(data["name"].to_s))
      data["chat_message"] = JSON::Any.new(sanitizer.process(data["chat_message"].to_s))
      data["chat_message"] = JSON::Any.new(" [#{Time.utc.month}/#{Time.utc.day}/#{Time.utc.year} #{Time.utc.hour}:#{Time.utc.minute}:#{Time.utc.second}] #{data["chat_message"].to_s.gsub("<br/>", "").squeeze(' ').to_s}")
    end
    if room == "" || room == nil
      redis = Redis.new
      redis.rpush "chats", data.to_json
      if redis.ttl("chats") == -1
        redis.expire("chats", 7 * 24 * 3600)
      end
      msg["payload"] = JSON::Any.new(data)
      ChatSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", msg["payload"].as_h)
      # client.say("#gbaldraw", "<#{data["name"]}> #{data["chat_message"]}")
      IrcChannel.send([data["name"].to_s, data["chat_message"].to_s])

      DiscordChannel.send([data["name"].to_s, data["chat_message"].to_s])
    else
      redis = Redis.new
      redis.rpush "chats_#{room}", data.to_json
      if redis.ttl("chats_#{room}") == -1
        redis.expire("chats_#{room}", 7 * 24 * 3600)
      end
      msg["payload"] = JSON::Any.new(data)
      ChatSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", msg["payload"].as_h)
    end
  end

  def handle_leave(client_socket)
  end
end
