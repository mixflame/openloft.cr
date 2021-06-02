import Amber from 'amber';

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');

window.setupText = () => {
    console.log("connected to /text")
    if(window.text_socket.channels.length == 0){
        window.text_channel = chat_socket.channel('text:' + window.room)
        window.text_channel.join()
    } else {
        window.text_socket.channels = [];
        window.text_channel = chat_socket.channel('text:' + window.room)
        window.text_channel.join()
    }

    text_channel.on('message_new', (data) => {
        console.log(data);
        // console.log(data);
    })

    text_channel.on('user_join', (data) => { })
}


window.text_socket = new Amber.Socket('/text')
text_socket.connect()
    .then(setupText)
    window.text_socket._reconnect = () => {
        clearTimeout(window.text_socket.reconnectTimeout)
        window.text_socket.reconnectTimeout = setTimeout(() => {
          window.text_socket.reconnectTries++
          window.text_socket.connect(window.text_socket.params).then(setupText);
          window.text_socket._reconnect()
        }, window.text_socket._reconnectInterval())
      }