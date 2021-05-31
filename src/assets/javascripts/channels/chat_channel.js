import Amber from 'amber';

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');


window.setupChat = () => {
    console.log("connected to /chat")
    if(window.chat_socket.channels.length == 0){
        window.chat_channel = chat_socket.channel('chat:' + window.room)
        window.chat_channel.join()
    } else {
        window.chat_socket.channels = [];
        window.chat_channel = chat_socket.channel('chat:' + window.room)
        window.chat_channel.join()
    }
    if (!window.dontLog) console.log("Connected to chat channel");

    chat_channel.on('message_new', (data) => {
        console.log(data);
        if (data["reload"] == true && window.name == "stream") {
            location.reload();
        } else if (data["reload"] == true && window.name != "stream") {
            return;
        }
        // Called when there's incoming data on the websocket for this channel
        $("#chat_area").html($("#chat_area").html() + "<p style='margin: 0px;'>" + "&lt" + data["name"] + "&gt" + data["chat_message"] + "</p>");

        $("img").one("load", function () {
            window.scroll_to_bottom();
        });

        if (data['chat_message'].includes(window.name) && data['name'] != window.name) {
            window.notifyMe("<" + data["name"] + ">" + data["chat_message"]);
        }

        window.scroll_to_bottom();

        // console.log(data);
    })

    chat_channel.on('user_join', (data) => { })

}

window.chat_socket = new Amber.Socket('/chat')
chat_socket.connect()
    .then(setupChat)
    window.chat_socket._reconnect = () => {
        clearTimeout(window.chat_socket.reconnectTimeout)
        window.chat_socket.reconnectTimeout = setTimeout(() => {
          window.chat_socket.reconnectTries++
          window.chat_socket.connect(window.chat_socket.params).then(setupChat);
          window.chat_socket._reconnect()
        }, window.chat_socket._reconnectInterval())
      }