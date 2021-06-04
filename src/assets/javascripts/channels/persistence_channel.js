import Amber from 'amber';

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

var uuid = uuidv4();

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');


window.setupPersistence = () => {
    console.log("connected to /persistence")
    if(window.persistence_socket.channels.length == 0){
        window.persistence_channel = persistence_socket.channel('persistence:' + window.room + "_" + uuid)
        window.persistence_channel.join()
    } else {
        window.persistence_socket.channels = [];
        window.persistence_channel = persistence_socket.channel('persistence:' + window.room + "_" + uuid)
        window.persistence_channel.join()
    }
    if (!window.dontLog) console.log("Connected to persistence channel");
    $("#status").text("loading canvas");
    // this.perform('connected', {id: uuid});

    persistence_channel.push("message_new", {connected: true});

    persistence_channel.on('message_new', (data) => {
        if(data["operation"] == "insert") {
            const value = data["value"];
            const index = data["index"];
            // let changes = new Uint8Array(atob(data["changes"]).split("").map(
            //     (char)=>char.charCodeAt(0)
            //   )
            //  );
            //  console.log(changes);
            // let [newDoc, patch] = Automerge.applyChanges(currentDoc, [changes])

            // currentDoc = Automerge.merge(currentDoc, newDoc)

            // console.log(currentDoc.text)

            // let finalDoc = Automerge.merge(newDoc, currentDoc)
            // var sel = getInputSelection($("#collaborative_text")[0]);
            // $("#collaborative_text").val(newDoc.text);

            // const selection = selectionManager.getSelection();
            // const start = selection["anchor"];
            // const end = selection["target"];
            // console.log(`start: ${start} end: ${end}`);
            // const xStart = transformIndexOnInsert(start, index, value);
            // const xEnd = transformIndexOnInsert(end, index, value);

            textEditor.insertText(index, value);
            // textEditor.setText(newDoc.text.toString());

            // textEditor._inputManager._control.setSelectionRange(xStart + 1, xEnd + 1)
            // $("#collaborative_text").focus()
            // setInputSelection($("#collaborative_text")[0], sel.start, sel.end);
            // selectionManager.updateSelectionsOnInsert(index, value);
            // currentDoc = newDoc;
            return;
        } else if(data["operation"] == "delete") {
            const length = data["length"];
            const index = data["index"]
            // let changes = new Uint8Array(atob(data["changes"]).split("").map(
            //     (char)=>char.charCodeAt(0)
            //   )
            //  );
            // let [newDoc, patch] = Automerge.applyChanges(currentDoc, [changes])
            // var sel = getInputSelection($("#collaborative_text")[0]);
            // $("#collaborative_text").val(newDoc.text);
            textEditor.deleteText(index, length);
            // $("#collaborative_text").focus()
            // setInputSelection($("#collaborative_text")[0], sel.start, sel.end);
            
            // textEditor.setText(newDoc.text.toString());
            // selectionManager.updateSelectionsOnDelete(index, length);
            // currentDoc = newDoc;
            return;
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
            return;
            }
        }



        // handle new message here
        console.log(data);
        var count = $(data['canvas']).length;
        var packets_length = data['packets'];
        window.total = 0;
        if (count == 0) {
            window.redraw(true, true);
            // window.redraw(false, false);
            $("#status").text("canvas loaded");
            window.disabled = false;
            $("#join-button").click();
            console.log("canvas session joined")

        } else {

            data['canvas'].forEach(function (json, index) {
                var point = JSON.parse(json);
                window.addClick(point["x"], point["y"], point["dragging"], true, point["name"], point["color"], point['size'], point['text'], point['path'], point['line_join'], point['shape_type'], point['shape_width'], point['shape_height'], point['shape_fill'], point["shape_angle"], point["brush_style"], point["count"]);
                // window.redraw(true, false);
                window.total = window.total + 1;
                if (packets_length == window.total) {
                    window.redraw(true, true);
                    $("#status").text("canvas loaded");
                    window.disabled = false;
                    $("#join-button").click();
                } else {
                    $("#status").text("canvas loading... " + index + "/" + count);
                }
            });
        }
    })

    persistence_channel.on('user_join', (data) => { })
}

window.persistence_socket = new Amber.Socket('/persistence')
persistence_socket.connect()
    .then(setupPersistence)
    window.persistence_socket._reconnect = () => {
        clearTimeout(window.persistence_socket.reconnectTimeout)
        window.persistence_socket.reconnectTimeout = setTimeout(() => {
          window.persistence_socket.reconnectTries++
          window.persistence_socket.connect(window.persistence_socket.params).then(setupPersistence);
          window.persistence_socket._reconnect()
        }, window.persistence_socket._reconnectInterval())
      }