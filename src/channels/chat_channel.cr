class ChatChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
    puts "chat joined"
    puts message
    # redis = Redis.new("127.0.0.1", 6379)
    # room = message["topic"].to_s.split(":").last
  end

  def handle_message(client_socket, message)
    puts message
    data = message.as_h["payload"].as_h
    msg = message.as_h
    room = data["room"].to_s rescue ""
    # Sanitizer = Sanitize::Policy::HTMLSanitizer.basic
    if(data.has_key?("online") && data["online"] == true)
      data["name"] = JSON::Any.new(Sanitizer.process(data["name"].to_s))
      redis = Redis.new("127.0.0.1", 6379)
      # ids = redis.hkeys("online_#{room}").map { |i| i.to_s }.to_a

      redis.hset("online_#{room}", client_socket.as(Amber::WebSockets::ClientSocket).id, data["name"].to_s)
      redis.hset("id_in_room", client_socket.as(Amber::WebSockets::ClientSocket).id, room)
      nicks = redis.hvals("online_#{room}").map { |n| n.to_s }.to_a.uniq
      if !nicks.includes?(data["name"].to_s)
        nicks << data["name"].to_s
      end
      ChatSocket.broadcast("join", message.as_h["topic"].to_s, "user_join", {join: true, nicks: nicks, name: data["name"].to_s}.to_h)


      # alert slack https://slack.com/api/calls.participants.add

      message = {
        id: redis.get("#{room}_slack_call_id").to_s,
        users: [
          {external_id: data["name"].to_s, display_name: data["name"].to_s}.to_h
        ].to_a
      }.to_h

      puts message.inspect
  
      uri = URI.parse("https://slack.com/api/calls.participants.add")
  
      client = HTTP::Client.new uri
  
      client.before_request do |request|
          request.headers["Authorization"] = "Bearer xoxb-2208532755014-2235711764308-8HLxfgiGdgTIYoHSBrI4AdR1"
          request.headers["Content-Type"] = "application/json"
          request.body = message.to_json
          request.content_length = request.body.to_s.bytesize
      end
      response = client.post(uri.path)

      puts "calls.participants.add: #{response.body.to_s}"


      # client_socket.socket.send({"event" => "message", "topic" => message["topic"].to_s, "subject" => "message_new", "payload" => {nicks: nicks}}.to_json)
      return
    end
    if data.has_key?("ping")
      if data["ping"].as_bool == true
        # puts "broadcasting ping"
        # Fiber.yield
        rebroadcast!(message)
        return
      end
    end
    if(!data["name"].nil? && !data["chat_message"].nil?)
      data["name"] = JSON::Any.new(Sanitizer.process(data["name"].to_s))
      data["chat_message"] = JSON::Any.new(Sanitizer.process(data["chat_message"].to_s))
      # data["chat_message"] = JSON::Any.new(" [#{Time.utc.month}/#{Time.utc.day}/#{Time.utc.year} #{Time.utc.hour}:#{Time.utc.minute}:#{Time.utc.second}] #{data["chat_message"].to_s.gsub("<br/>", "").squeeze(' ').to_s}")
      data["chat_message"] = JSON::Any.new(" #{data["chat_message"].to_s.gsub("<br/>", "").squeeze(' ').to_s}")
    end

    if room == "" || room == nil
      redis = Redis.new("127.0.0.1", 6379)
      redis.rpush "chats", data.to_json
      if redis.ttl("chats") == -1
        redis.expire("chats", 7 * 24 * 3600)
      end
      msg["payload"] = JSON::Any.new(data)
      ChatSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", msg["payload"].as_h)
      # client.say("#gbaldraw", "<#{data["name"]}> #{data["chat_message"]}")
      policy = Sanitize::Policy::Text.new
      IrcChannel.send([data["name"].to_s, policy.process(data["chat_message"].to_s)])

      DiscordChannel.send([data["name"].to_s, policy.process(data["chat_message"].to_s)])
    else
      redis = Redis.new("127.0.0.1", 6379)
      redis.rpush "chats_#{room}", data.to_json
      if redis.ttl("chats_#{room}") == -1
        redis.expire("chats_#{room}", 7 * 24 * 3600)
      end
      msg["payload"] = JSON::Any.new(data)
      ChatSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", msg["payload"].as_h)
    end
  end

  def handle_leave(client_socket)
    puts "chat left"

    redis = Redis.new("127.0.0.1", 6379)
    room = redis.hget("id_in_room", client_socket.as(Amber::WebSockets::ClientSocket).id).to_s
    name = redis.hget("online_#{room}", client_socket.as(Amber::WebSockets::ClientSocket).id).to_s
    redis.hdel("id_in_room", client_socket.as(Amber::WebSockets::ClientSocket).id)
    redis.hdel("online_#{room}", client_socket.as(Amber::WebSockets::ClientSocket).id)
    
    nicks = redis.hvals("online_#{room}").map { |n| n.to_s }.to_a.uniq

    # not really a join, just use this message
    ChatSocket.broadcast("join", "chat:#{room}", "user_join", {join: false, nicks: nicks.to_a, name: name.to_s}.to_h)


    message = {
        id: room,
        users: [
          {external_id: name.to_s, display_name: name.to_s}
        ]
      }.to_h
      headers = HTTP::Headers{"Content-Type" => "application/json"}
  
      uri = URI.parse("https://slack.com/api/calls.participants.remove")
  
      client = HTTP::Client.new uri
  
      client.before_request do |request|
          request.headers["Authorization"] = "Bearer xoxb-2208532755014-2235711764308-8HLxfgiGdgTIYoHSBrI4AdR1"
          request.headers["Content-Type"] = "application/json"
          request.body = message.to_json
          request.content_length = request.body.to_s.bytesize
      end
      response = client.post(uri.path)

      puts "calls.remove: #{response.body.to_s}"

  end
end
