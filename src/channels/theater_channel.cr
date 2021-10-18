class TheaterChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    data = message.as_h["payload"].as_h
    room = data["room"].to_s
    if data.has_key?("url") && data["event"] == "load"
      redis = REDIS
      redis.set("#{room}_media_url", data["url"].to_s)
      # SessionSocket.broadcast("join", message.as_h["topic"].to_s, "user_join", {time: redis.get("#{room}_media_time").to_f, url: redis.get("#{room}_media_url").to_s}.to_h)
    end
    # if data.has_key?("event") && data["event"] == "timeupdate"
    #   redis = REDIS
    #   redis.set("#{room}_media_time", data["time"].to_s)
    # end

    rebroadcast!(message)
  end

  def handle_leave(client_socket)
  end
end
