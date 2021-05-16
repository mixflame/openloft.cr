class PersistenceChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
    puts "persistence handle joined"
    data = message
    room = data["room"] rescue ""
    if room != "" && room != nil
      puts ">>> running connected method"
      puts "data: #{data}"
      redis = Redis.new
      packets = [] of String
      amt_packets = redis.llen("packets")
      if amt_packets >= 50000
        packets = redis.lrange("packets", -50000, -1)
      else
        packets = redis.lrange("packets", 0, -1)
      end
  


      # packets.each_slice(5000) do |slice|
      #   ActionCable.server.broadcast("persistence_#{data['id']}", {canvas: slice, packets: packets.length})
      # end

      # ActionCable.server.broadcast("persistence_#{data['id']}", {done: true})

      rebroadcast!({topic: "message_new", canvas: packets, packets: packets.size})
      
    else
      puts ">>> running connected method"
      puts "data: #{data}"
      redis = Redis.new
      packets = nil
      # amt_packets = redis.llen("packets_#{params[:room]}")
      # if amt_packets >= 50000
        # packets = redis.lrange("packets_#{params[:room]}", -50000, -1)
      # else
      packets = redis.lrange("packets_#{data["room"]}", 0, -1)
      # end


      # packets.each_slice(5000) do |slice|
      #   ActionCable.server.broadcast("persistence_#{data['id']}_#{params[:room]}", {canvas: slice, packets: packets.length})
      # end

      # ActionCable.server.broadcast("persistence_#{data['id']}_#{params[:room]}", {done: true})

      rebroadcast!({topic: "message_new", canvas: packets, packets: packets.size})
    end
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
  
        rebroadcast!({topic: "message_new", canvas: packets, packets: packets.size})
        
      else
        puts ">>> running connected method"
        puts "data: #{data}"
        redis = Redis.new
        packets = [] of String

        packets = redis.lrange("packets_#{data["room"]}", 0, -1)

  
        rebroadcast!({topic: "message_new", canvas: packets, packets: packets.size})
      end
    end
  end

  def handle_leave(client_socket)
  end
end
