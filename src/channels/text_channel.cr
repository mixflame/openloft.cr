class TextChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    puts message
    data = message.as_h["payload"].as_h
    room = data["room"].to_s

    redis = REDIS
    redis.rpush "changes_#{room}", data.to_json


    rebroadcast!(message)
  end

  def handle_leave(client_socket)
  end
end
