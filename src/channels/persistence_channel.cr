class PersistenceChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
    puts "persistence joined"
  end

  def handle_message(client_socket, message)
    puts "data: #{message}"
    data = message.as_h["payload"].as_h
    room = message.as_h["topic"].to_s.split(":")[1].split("_")[0].to_s rescue ""
    room = room == "null" ? nil : room
    puts "persistence room: #{room}"
    if data.has_key?("connected") && data["connected"] == true
      if room == "" || room == nil
        puts ">>> running connected method"
        
        redis = Redis.new
        packets = [] of String
        amt_packets = redis.llen("packets")
        if amt_packets >= 50000
          packets = redis.lrange("packets", -50000, -1)
        else
          packets = redis.lrange("packets", 0, -1)
        end

        # puts packets

        PersistenceSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", {canvas: packets, packets: packets.size}.to_h)
        
      else
        puts ">>> running connected method"
        redis = Redis.new
        packets = [] of String
        packets = redis.lrange("packets_#{room}", 0, -1)

        PersistenceSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", {canvas: packets, packets: packets.size}.to_h)
      end
    end

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
        #packets.each do |packet|
          PersistenceSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", {text_packets: packets}.to_h)
        #end
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

        #packets.each do |packet|
          PersistenceSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", {text_packets: packets}.to_h)
        #end
      end
    end
  end

  def handle_leave(client_socket)
  end
end
