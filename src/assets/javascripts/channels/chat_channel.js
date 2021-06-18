import Amber from 'amber';

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');


window.setupChat = () => {
    console.log("connected to /chat")
    if (window.chat_socket.channels.length == 0) {
        window.chat_channel = chat_socket.channel('chat:' + window.room)
        window.chat_channel.join()
    }
    if (!window.dontLog) console.log("Connected to chat channel");

    window.chat_channel.push("message_new", { online: true, name: window.name });

    window.start_pinging();
    setInterval(window.start_pinging, 3000);

    chat_channel.on('message_new', (data) => {
        console.log(data);

        if (data["ping"]) {
            window.last_ping[data['name']] = Date.now();
            if (!window.nicks.includes(data["name"]))
                window.nicks.push(data["name"]);
            return;
        }

        console.log(data);
        if (data["reload"] == true && window.name == "stream") {
            location.reload();
        } else if (data["reload"] == true && window.name != "stream") {
            return;
        }
        // Called when there's incoming data on the websocket for this channel
        $("#chat_area").html($("#chat_area").html() + "<p style='margin: 0px;'>" + "&lt" + data["name"] + "&gt" + data["chat_message"] + "</p>");

        $("img").one("load", function() {
            window.scroll_to_bottom();
        });

        if (data['chat_message'].includes(window.name) && data['name'] != window.name) {
            window.notifyMe("<" + data["name"] + ">" + data["chat_message"]);
        }

        window.scroll_to_bottom();

        // console.log(data);
    })

    chat_channel.on('user_join', (data) => {
        console.log(data);




        if (data["name"] != window.name) {
            if (window.nicks.length < data["nicks"].length) {
                //someone came online
                var ding = new Audio("/ding.wav")
                ding.volume = 0.5;
                ding.play().catch((e) => {
                    console.log(e.message)
                })
            } else if (window.nicks.length > data["nicks"].length) {
                // someone went away
                var dong = new Audio("/dong.wav")
                dong.volume = 0.5;
                dong.play().catch((e) => {
                    console.log(e.message)
                })
            }
        }

        window.nicks = data["nicks"];

        $("#connected_users").html("");
        for (const nick in window.nicks) {
            if (Object.hasOwnProperty.call(window.nicks, nick)) {
                const n = window.nicks[nick];
                window.last_ping[n] = Date.now();
                setInterval(() => {
                    if (window.last_ping[n] < Date.now() - (10000)) {
                        $(".online-" + n).remove()
                        arrayRemove(window.nicks, n);
                    }
                }, 3000);
                $("#connected_users").html($("#connected_users").html() + `<li class='online-${n}'>${n}</li>`)
            }
        }


        var parent = $("#connected_users")[0],
            // take items (parent.children) into array
            itemsArray = Array.prototype.slice.call(parent.children);

        // sort items in array by custom criteria
        itemsArray.sort(function(a, b) {
            // inner text suits best (even when formated somehow)
            if (a.innerText < b.innerText) return -1;
            if (a.innerText > b.innerText) return 1;
            return 0;
        });

        // reorder items in the DOM
        itemsArray.forEach(function(item) {
            // one by one move to the end in correct order
            parent.appendChild(item);
        });
        return;
    })

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

window.arrayRemove = function(arr, value) {

    return arr.filter(function(ele) {
        return ele != value;
    });
}