class CanvasChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
    puts "canvas joined"
  end

  def handle_message(client_socket, message)
    puts message
    data = message.as_h["payload"].as_h
    room = data["room"].to_s rescue ""
    puts "canvas room: #{room.inspect}"
    puts "data: #{data}"
    if data.has_key?("ping")
      if data["ping"].as_bool == true
        puts "broadcasting ping"
        rebroadcast!(message)
        return
      end
    end
    if room == "" || room == nil
      puts "global room"
      redis = Redis.new
      if data.has_key?("undo") && data["undo"].as_bool == true
        puts "undoing"
        all_packets = [] of String
        amt_packets = redis.llen("packets")
        if amt_packets >= 50000
          all_packets = redis.lrange("packets", -50000, -1)
        else
          all_packets = redis.lrange("packets", 0, -1)
        end
        first_edit = all_packets.each_index.select { |i| all_packets[i] =~ /dragging":false.+"name":"#{data["name"]}"/}.to_a.last
        last_edit = all_packets.each_index.select { |i| all_packets[i] =~ /dragging":true.+"name":"#{data["name"]}"/}.to_a
        redis.lrem("packets", first_edit, all_packets[first_edit])
        last_edit.each do |le|
          redis.lrem("packets", le, all_packets[le]) if le >= first_edit
        end
        # ActionCable.server.broadcast("canvas", data)
        CanvasSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", data)
        return
      end
      redis.rpush "packets", data.to_json
      puts "TTL packets: #{redis.ttl("packets")}"
      if redis.ttl("packets") == -1
        redis.expire("packets", 7 * 24 * 3600)
        redis.incr("balda_counter")
      end
      redis.hincrby("all_time", data["name"], 1) if data.has_key?("name")
      CanvasSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", data)
    else
      redis = Redis.new
      if data.has_key?("undo") && data["undo"] == true
        puts "undoing"
        all_packets = [] of String
        amt_packets = redis.llen("packets_#{room}")
        if amt_packets >= 50000
          all_packets = redis.lrange("packets_#{room}", -50000, -1)
        else
          all_packets = redis.lrange("packets_#{room}", 0, -1)
        end
        first_edit = all_packets.each_index.select { |i| all_packets[i] =~ /dragging":false.+"name":"#{data["name"]}"/}.to_a.last
        last_edit = all_packets.each_index.select { |i| all_packets[i] =~ /dragging":true.+"name":"#{data["name"]}"/}.to_a
        redis.lrem("packets_#{room}", first_edit, all_packets[first_edit])
        last_edit.each do |le|
          redis.lrem("packets_#{room}", le, all_packets[le]) if le >= first_edit
        end
        CanvasSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", data)
        return
      end
      redis.rpush "packets_#{room}", data.to_json
      puts "TTL packets: #{redis.ttl("packets_#{room}")}"
      if redis.ttl("packets_#{room}") == -1
        redis.expire("packets_#{room}", 24 * 3600 * 7)
        redis.incr("balda_counter")
      end
      CanvasSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", data)
    end
  end

  def handle_leave(client_socket)
  end
end
