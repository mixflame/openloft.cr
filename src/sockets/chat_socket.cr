struct ChatSocket < Amber::WebSockets::ClientSocket
  channel "chat:*", ChatChannel
  
  def on_connect
    # do some authentication here
    # return true or false, if false the socket will be closed
    true
  end

  # @@uuid : String = UUID.random.to_s

  # def self.do_dispatch(event : String, topic : String, subject : String, payload : String)
  #   publisher : redis = Redis.new("127.0.0.1", 6379)(url: Amber.settings.redis_url)

  #   message = {"event" => event,"topic" => topic,"subject" => subject,"payload" => payload}

  #   publisher.publish("chat", {"sender" => @@uuid, "msg" => message}.to_json)
  # end
end
