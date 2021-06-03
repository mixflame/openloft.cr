import Amber from 'amber';

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');

window.setupText = () => {
    console.log("connected to /text")
    if(window.text_socket.channels.length == 0){
        window.text_channel = text_socket.channel('text:' + window.room)
        window.text_channel.join()
    } else {
        window.text_socket.channels = [];
        window.text_channel = text_socket.channel('text:' + window.room)
        window.text_channel.join()
    }

    text_channel.on('message_new', (data) => {
        if(data["user_id"] == window.currentUser) return;
        console.log(data);
        // console.log(data);

        let changes = new Uint8Array(atob(data["changes"]).split("").map(
            (char)=>char.charCodeAt(0)
          )
         );
        console.log([changes]);
        console.log("currentDoc: ")
        console.log(currentDoc)
        let [newDoc, patch] = Automerge.applyChanges(currentDoc, [changes])

        console.log(newDoc)
        console.log(patch)

        $("#collaborative_text").val(newDoc.text);

        currentDoc = newDoc;
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