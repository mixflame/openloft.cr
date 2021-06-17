struct SessionSocket < Amber::WebSockets::ClientSocket

  channel "session:*", SessionChannel

  def on_connect
    # do some authentication here
    # return true or false, if false the socket will be closed
    true
  end

  # @@uuid : String = UUID.random.to_s

  # def self.do_dispatch(event : String, topic : String, subject : String, payload : String)
  #   publisher : redis = Redis.new("127.0.0.1", 6379)(url: Amber.settings.redis_url)

  #   message = {"event" => event,"topic" => topic,"subject" => subject,"payload" => payload}

  #   publisher.publish("session", {"sender" => @@uuid, "msg" => message}.to_json)
  # end
end
