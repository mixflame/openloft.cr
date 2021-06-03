class TextChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    puts message
    data = message.as_h["payload"].as_h
    room = data["room"].to_s rescue ""

    if data.has_key?("connected") && data["connected"] == true
      if room == "" || room == nil
        puts ">>> running (text) connected method"
        
        redis = Redis.new
        packets = [] of String
        amt_packets = redis.llen("changes")
        if amt_packets >= 50000
          packets = redis.lrange("changes", -50000, -1)
        else
          packets = redis.lrange("changes", 0, -1)
        end

        # puts packets
        packets.each do |packet|
          TextSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", JSON.parse(packet.to_s).as_h.to_h)
        end
      else
        puts ">>> running (text) connected method"
        
        redis = Redis.new
        packets = [] of String
        amt_packets = redis.llen("changes_#{room}")
        if amt_packets >= 50000
          packets = redis.lrange("changes_#{room}", -50000, -1)
        else
          packets = redis.lrange("changes_#{room}", 0, -1)
        end

        # puts packets

        packets.each do |packet|
          TextSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", JSON.parse(packet.to_s).as_h.to_h)
        end
      end

      return
    end

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
