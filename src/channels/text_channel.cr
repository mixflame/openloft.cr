class TextChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    puts message
    data = message.as_h["payload"].as_h
    room = data["room"].to_s rescue ""

    redis = Redis.new
    if room == "" || room == nil
      redis.rpush "changes", data.to_json
    else
      redis.rpush "changes_#{room}", data.to_json
    end


    rebroadcast!(message)
  end

  def handle_leave(client_socket)
  end
end
