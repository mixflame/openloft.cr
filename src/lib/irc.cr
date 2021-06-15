require "json"
require "socket"

class Client
  getter version : String = "gbaldraw-bridge v0.0.2"

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

  def initialize
    configure
    while true
      @tcp_client = TCPSocket.new(server, port)
      
      while true
        Fiber.yield
        # sleep 0.1
        response = get_response
        next unless response

        pong(response)

        login
        privmsg(response)
        join_channels

        break if logged_in && version_sent && channels_joined
      end

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
            unless name.includes?("@discord") && channel.includes?("#8chan")
              say(channel, "#{name} -> #{chat}")
            end
          end
        end
      end
      
      tcp_client.close

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
    return if name == "gbaldraw-bridge" || name == "gbaldraw-bridge-dev"
    name = "#{name}@irc.rizon.net #{channel}"
    puts "name #{name}"
    # Sanitizer = Sanitize::Policy::HTMLSanitizer.basic
    name = Sanitizer.process(name.to_s)
    message = Sanitizer.process(message.to_s)
    # message = " [#{Time.utc.month}/#{Time.utc.day}/#{Time.utc.year} #{Time.utc.hour}:#{Time.utc.minute}:#{Time.utc.second}] #{message}"
    redis = REDIS
    redis.rpush "chats", {name: name, chat_message: message, room: nil}.to_h.to_json
    if redis.ttl("chats") == -1
      redis.expire("chats", 7 * 24 * 3600)
    end
    ChatSocket.broadcast("message", "chat:", "message_new", {name: name, chat_message: message}.to_h)
    if channel != "#8chan"
      DiscordChannel.send([name, message])
    end
  end

  def login
    return unless @response_count == 3
    tcp_client << "PASS #{password}\r\n"
    tcp_client << "NICK #{nick}\r\n"
    tcp_client << "USER #{user} 8 * :#{user}\r\n"
    @logged_in = true
  end

  def version(response)
    return unless response.includes?("VERSION")
    puts "VERSION #{version}"
    tcp_client << "VERSION #{version}\r\n"
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
    tcp_client << "PONG :#{parts[1]}\r\n"
  end

  def kick_rejoin(response)
    
    parts = response.to_s.split(" ")
    puts parts.inspect
    return unless parts[1].to_s == "KICK"
    # return unless parts.size == 5
    
    channel = parts[2].to_s
    # sleep 5.seconds
    tcp_client << "JOIN #{channel}\r\n"
  end

  def get_response
    response = @tcp_client.gets
    if response
      # puts response
      @response_count += 1
    end
    response
  end

  def join_channels
    return unless version_sent || channels_joined
    channels.each do |channel|
      tcp_client << "JOIN #{channel}\r\n"
      sleep 0.2
    end
    @channels_joined = true
  end

  def say(channel, what)
    tcp_client << "PRIVMSG #{channel} :#{what}\r\n"
  end

  def configure
    @server = "irc.rizon.io"
    @port = 6667
    @nick = "gbaldraw-bridge"
    if Amber.env == :development
        @nick = "gbaldraw-bridge-dev"
    end
    @user = "gbaldraw-bridge"
    @password = "none"
    if Amber.env == :development
      @channels = ["#gbaldraw"]
    else
      @channels = ["#gbaldraw", "#8chan"]
    end
  end
end
