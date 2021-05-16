struct PersistenceSocket < Amber::WebSockets::ClientSocket

  channel "persistence:*", PersistenceChannel

  def on_connect
    # do some authentication here
    # return true or false, if false the socket will be closed
    true
  end
end
