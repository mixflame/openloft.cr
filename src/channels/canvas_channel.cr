class CanvasChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    data = message
    room = data["room"]
    puts "data: #{data}"
    if room != "" && room != nil
      redis = Redis.new
      if data["undo"] == true
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
        rebroadcast!(data)
        return
      end
      if data["ping"] == true
        rebroadcast!(data)
        return
      end
      redis.rpush "packets", data.to_json
      puts "TTL packets: #{redis.ttl("packets")}"
      if redis.ttl("packets") == -1
        redis.expire("packets", 7 * 24 * 3600)
        redis.incr("balda_counter")
      end
      redis.hincrby("all_time", data["name"], 1)
      rebroadcast!(data)
    else
      redis = Redis.new
      if data["undo"] == true
        puts "undoing"
        all_packets = [] of String
        amt_packets = redis.llen("packets_#{data["room"]}")
        if amt_packets >= 50000
          all_packets = redis.lrange("packets_#{data["room"]}", -50000, -1)
        else
          all_packets = redis.lrange("packets_#{data["room"]}", 0, -1)
        end
        first_edit = all_packets.each_index.select { |i| all_packets[i] =~ /dragging":false.+"name":"#{data["name"]}"/}.to_a.last
        last_edit = all_packets.each_index.select { |i| all_packets[i] =~ /dragging":true.+"name":"#{data["name"]}"/}.to_a
        redis.lrem("packets_#{data["room"]}", first_edit, all_packets[first_edit])
        last_edit.each do |le|
          redis.lrem("packets_#{data["room"]}", le, all_packets[le]) if le >= first_edit
        end
        rebroadcast!(data)
        return
      end
      if data["ping"] == true
        rebroadcast!(data)
        return
      end
      redis.rpush "packets_#{data["room"]}", data.to_json
      puts "TTL packets: #{redis.ttl("packets_#{data["room"]}")}"
      if redis.ttl("packets_#{data["room"]}") == -1
        redis.expire("packets_#{data["room"]}", 24 * 3600 * 7)
        redis.incr("balda_counter")
      end
      rebroadcast!(data)
    end
  end

  def handle_leave(client_socket)
  end
end
