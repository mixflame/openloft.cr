class SessionChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    SessionSocket.broadcast("message", message.as_h["topic"].to_s, "message_new", message.as_h["payload"].as_h.to_h)
  end

  def handle_leave(client_socket)
  end
end
