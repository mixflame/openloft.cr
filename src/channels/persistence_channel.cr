class PersistenceChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    data = message
    room = data["room"]
    if data["reload"] == true
      if room != "" && room != nil
        puts ">>> running reload method"
        puts "data: #{data}"
        redis = Redis.new
        packets = [] of String
        amt_packets = redis.llen("packets")
        if amt_packets >= 50000
          packets = redis.lrange("packets", -50000, -1)
        else
          packets = redis.lrange("packets", 0, -1)
        end
  
        rebroadcast!({topic: "persistence:#{data["id"]}", canvas: packets, packets: packets.size})
        
      else
        puts ">>> running connected method"
        puts "data: #{data}"
        redis = Redis.new
        packets = [] of String

        packets = redis.lrange("packets_#{data["room"]}", 0, -1)

  
        rebroadcast!({topic: "persistence:#{data["id"]}:#{data["room"]}", canvas: packets, packets: packets.size})
      end
    end
  end

  def handle_leave(client_socket)
  end
end
