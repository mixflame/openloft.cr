class SessionChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
    puts "session joined"
    puts message
    SessionSocket.broadcast("join", message.as_h["topic"].to_s, "user_join", {} of String => String)
  end

  def handle_message(client_socket, message)
    rebroadcast!(message)
  end

  def handle_leave(client_socket)
  end
end
