import Amber from 'amber';

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');


window.chat_socket = new Amber.Socket('/chat')
chat_socket.connect()
    .then(() => {
        console.log("connected to /chat")
        window.chat_channel = chat_socket.channel('chat:' + window.room)
        window.chat_channel.join()
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

    })