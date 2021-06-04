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

    text_channel.push("message_new", {connected: true, room: room});

    text_channel.on('message_new', (data) => {
        if(data["user_id"] == window.currentUser) return;
        console.log(data);

        if(data["operation"] == "insert") {
            const value = data["value"];
            const index = data["index"]
            var newDoc = Automerge.change(currentDoc, doc => {
                if(!doc.text)
                    doc.text = new Automerge.Text()
                doc.text.insertAt(index, value);
            })

            // currentDoc = Automerge.merge(currentDoc, newDoc)

            console.log(newDoc.text)

            // let finalDoc = Automerge.merge(newDoc, currentDoc)
            // var sel = getInputSelection($("#collaborative_text")[0]);
            // $("#collaborative_text").val(newDoc.text);
            // textEditor.insertText(index, value);
            textEditor.setText(newDoc.text.toString());
            // $("#collaborative_text").focus()
            // setInputSelection($("#collaborative_text")[0], sel.start, sel.end);
            selectionManager.updateSelectionsOnInsert(index, value);
            currentDoc = newDoc;
        } else if(data["operation"] == "delete") {
            const length = data["length"];
            const index = data["index"]
            var newDoc = Automerge.change(currentDoc, doc => {
                if(!doc.text)
                    doc.text = new Automerge.Text()
                doc.text.deleteAt(index, length);
            })
            // var sel = getInputSelection($("#collaborative_text")[0]);
            // $("#collaborative_text").val(newDoc.text);
            // textEditor.setText(newDoc.text);
            // $("#collaborative_text").focus()
            // setInputSelection($("#collaborative_text")[0], sel.start, sel.end);
            
            textEditor.setText(newDoc.text.toString());
            selectionManager.updateSelectionsOnDelete(index, length);
            currentDoc = newDoc;
        } else if(data["operation"] == "selection") {
            var collaborator;
            try {
                collaborator = selectionManager.addCollaborator(data["name"], data["name"], "red", {anchor: data["anchor"], target: data["target"]});
            } catch {
                collaborator = selectionManager.getCollaborator(data["name"]);
            } finally {
                
                    collaborator.setSelection({anchor: data["anchor"], target: data["target"]});
                    collaborator.flashCursorToolTip(2);


                    // selectionManager.removeCollaborator(data["name"]);
                }
            

              
            
        }
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