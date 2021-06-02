struct TextSocket < Amber::WebSockets::ClientSocket

  channel "text:*", TextChannel

  def on_connect
    # do some authentication here
    # return true or false, if false the socket will be closed
    true
  end
end
