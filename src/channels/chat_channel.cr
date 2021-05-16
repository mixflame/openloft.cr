class ChatChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    data = message.as_h
    room = data["room"] rescue ""
    sanitizer = Sanitize::Policy::HTMLSanitizer.common
    if(!data["name"].nil? && !data["chat_message"].nil?)
      data["name"] = JSON::Any.new(sanitizer.process(data["name"].to_s))
      data["chat_message"] = JSON::Any.new(sanitizer.process(data["chat_message"].to_s))
      data["chat_message"] = JSON::Any.new(" [#{Time.utc.month}/#{Time.utc.day}/#{Time.utc.year} #{Time.utc.hour}:#{Time.utc.minute}:#{Time.utc.second}] #{data["chat_message"]}")
    end
    if room != "" && room != nil
      redis = Redis.new
      redis.rpush "chats", data.to_json
      if redis.ttl("chats") == -1
        redis.expire("chats", 7 * 24 * 3600)
      end
      rebroadcast!(data)
    else
      redis = Redis.new
      redis.rpush "chats_#{data["room"]}", data.to_json
      if redis.ttl("chats_#{data["room"]}") == -1
        redis.expire("chats_#{data["room"]}", 7 * 24 * 3600)
      end
      rebroadcast!(data)
    end
  end

  def handle_leave(client_socket)
  end
end
