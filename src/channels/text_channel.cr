class TextChannel < Amber::WebSockets::Channel
  def handle_joined(client_socket, message)
  end

  def handle_message(client_socket, message)
    rebroadcast!(message)
  end

  def handle_leave(client_socket)
  end
end
