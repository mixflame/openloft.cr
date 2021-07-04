class TheaterChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    data = message.as_h["payload"].as_h
    room = data["room"].to_s rescue ""
    if data.has_key?("url") && data["event"] == "load"
      redis = Redis.new
      redis.set("#{room}_media_url", data["url"].to_s)
    end
    rebroadcast!(message)
  end

  def handle_leave(client_socket)
  end
end
