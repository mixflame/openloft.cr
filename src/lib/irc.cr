require "json"
require "socket"
require "openssl"

class Client
  getter version : String = "openloft-bridge v0.0.2"

  property server : String = ""
  property port : Int32 = 0
  property nick : String = ""
  property user : String = ""
  property password : String = ""
  property channels : Array(String) = [] of String
  property tcp_client : TCPSocket = TCPSocket.new
  property response_count : Int32 = 0
  property logged_in : Bool = false
  property version_sent : Bool = false
  property channels_joined : Bool = false

  property ssl_socket : (OpenSSL::SSL::Socket::Client | Nil) = nil
  
  def initialize(config)
    configure(config["server"], config["nick"], config["user"], config["password"], config["channels"])
    while true
      @tcp_client = TCPSocket.new(server, port)
      @ssl_socket = OpenSSL::SSL::Socket::Client.new(tcp_client, OpenSSL::SSL::Context::Client.new, true)

      while true
        Fiber.yield
        # sleep 0.1
        response = get_response
        next unless response

        puts response

        

        login

        pong(response)
        # privmsg(response)
        # sleep 10.seconds
        

        # puts "logged in: #{logged_in}"
        # puts "version sent: #{version_sent}"
        # puts "channels joined #{channels_joined}"

        got_end_of_motd = response.includes?("376")

        break if logged_in && got_end_of_motd
      end
      join_channels
      while true
        Fiber.yield
        # sleep 0.1
        response = get_response
        next unless response

        puts response

        pong(response)

        kick_rejoin(response)


        get_message(response)
        

        spawn do
          Fiber.yield
          message = IrcChannel.receive

          puts "message #{message}"

          name = message.first

          chat = message.last

          @channels.each do |channel|
            say(channel, "#{name} -> #{chat}")
          end
        end
      end
      
      ssl_socket.as(OpenSSL::SSL::Socket::Client).close

      sleep 5.seconds

      # reconnect after close because of loop
    end
  end


  def get_message(response)
    return unless response.to_s.includes?("PRIVMSG")
    parts = response.to_s.split(" :")
    message = parts.last
    # channel = match ? match.string : ""
    # message = message.gsub(/\#.+\:(?!$)/, "")
    # channel = channel.gsub(":", "")
    name = response.to_s.split(":")[1].split(" ").first.split("!").first
    channel = parts.first.split(" ")[2]
    if name.includes?("openloft-bridge") || name.includes?("OpenLoft Bridge Bot") || name.includes?("openloft-bridge-dev")
      return
    end
    name = "#{name}@#{server} #{channel}"
    puts "name #{name}"
    # Sanitizer = Sanitize::Policy::HTMLSanitizer.basic
    name = Sanitizer.process(name.to_s)
    message = Sanitizer.process(message.to_s)
    # message = " [#{Time.utc.month}/#{Time.utc.day}/#{Time.utc.year} #{Time.utc.hour}:#{Time.utc.minute}:#{Time.utc.second}] #{message}"
    redis = REDIS
    redis.rpush "chats", {name: name, chat_message: message, room: nil}.to_h.to_json
    # if redis.ttl("chats") == -1
    #   redis.expire("chats", 7 * 24 * 3600)
    # end
    ChatSocket.broadcast("message", "chat:gbalda", "message_new", {name: name, chat_message: message}.to_h)
    DiscordChannel.send([name, message])
  end

  def login
    return unless @response_count == 2
    ssl_socket.as(OpenSSL::SSL::Socket::Client) << "PASS #{password}\r\n"
    ssl_socket.as(OpenSSL::SSL::Socket::Client).flush
    ssl_socket.as(OpenSSL::SSL::Socket::Client) << "NICK #{nick}\r\n"
    ssl_socket.as(OpenSSL::SSL::Socket::Client).flush
    ssl_socket.as(OpenSSL::SSL::Socket::Client) << "USER #{user} 8 * :#{user}\r\n"
    ssl_socket.as(OpenSSL::SSL::Socket::Client).flush
    @logged_in = true
  end

  def version(response)
    return unless response.includes?("VERSION")
    puts "VERSION #{version}"
    ssl_socket.as(OpenSSL::SSL::Socket::Client) << "VERSION #{version}\r\n"
    ssl_socket.as(OpenSSL::SSL::Socket::Client).flush
    @version_sent = true
  end

  def privmsg(response)
    return unless response.includes?("PRIVMSG")
    version(response)
  end

  def pong(response)
    return unless response.to_s.starts_with?("PING")
    parts = response.to_s.split(":")
    return unless parts.size == 2
    puts "PONG :#{parts[1]}"
    ssl_socket.as(OpenSSL::SSL::Socket::Client) << "PONG :#{parts[1]}\r\n"
    ssl_socket.as(OpenSSL::SSL::Socket::Client).flush
  end

  def kick_rejoin(response)
    
    parts = response.to_s.split(" ")
    puts parts.inspect
    return unless parts[1].to_s == "KICK"
    # return unless parts.size == 5
    
    channel = parts[2].to_s
    # sleep 5.seconds
    ssl_socket.as(OpenSSL::SSL::Socket::Client) << "JOIN #{channel}\r\n"
    ssl_socket.as(OpenSSL::SSL::Socket::Client).flush
  end

  def get_response
    response = ssl_socket.as(OpenSSL::SSL::Socket::Client).gets
    if response
      # puts response
      @response_count += 1
    end
    response
  end

  def join_channels
    return if channels_joined
    
    channels.each do |channel|
      ssl_socket.as(OpenSSL::SSL::Socket::Client) << "JOIN #{channel}\r\n"
      ssl_socket.as(OpenSSL::SSL::Socket::Client).flush
      sleep 0.2
    end
    @channels_joined = true
  end

  def say(channel, what)
    ssl_socket.as(OpenSSL::SSL::Socket::Client) << "PRIVMSG #{channel} :#{what}\r\n"
    ssl_socket.as(OpenSSL::SSL::Socket::Client).flush
  end

  def configure(server, nick, user, password, channel)
    @server = server
    @port = 6697
    @nick = nick
    @user = user
    @password = password
    @channels = [] of String
    @channels << channel
  end
end
