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
        console.log(data);
        if(data["text_packets"] != undefined) {
            currentDoc = Automerge.init();
            textEditor.setText("");
            data["text_packets"].forEach(function(json, i) {
                var json_data = JSON.parse(json);
                if(json_data["operation"] == "insert") {
                    const value = json_data["value"];
                    const index = json_data["index"];
                    
                    var newDoc = Automerge.change(currentDoc, doc => {
                        if(!doc.text)
                            doc.text = new Automerge.Text();
        
                        doc.text.insertAt(index, value);
                    })
        
                    textEditor.setTextOnInsertWithSelections(newDoc.text.toString(), index, value);
        
                    currentDoc = newDoc;
                    return;
                } else if(json_data["operation"] == "delete") {
                    const length = json_data["length"];
                    const index = json_data["index"]

                    var newDoc = Automerge.change(currentDoc, doc => {
                        if(!doc.text)
                            doc.text = new Automerge.Text();

                        doc.text.deleteAt(index, length);
                    })

                    textEditor.setTextOnDeleteWithSelections(newDoc.text.toString(), index, length);

                    currentDoc = newDoc;

                    return;
                } else if(data["operation"] == "selection") {
                    var collaborator;
                    try {
                        collaborator = selectionManager.addCollaborator(json_data["name"], json_data["name"], "red", {anchor: json_data["anchor"], target: json_data["target"]});
                    } catch {
                        collaborator = selectionManager.getCollaborator(json_data["name"]);
                    } finally {
                        
                            collaborator.setSelection({anchor: json_data["anchor"], target: json_data["target"]});
                            collaborator.flashCursorToolTip(2);
        
        
                            // selectionManager.removeCollaborator(data["name"]);
                    return;
                    }
                }
            })


            return;
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
            // $("#join-button").click();
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
                    // $("#join-button").click();
                } else {
                    $("#status").text("canvas loading... " + index + "/" + count);
                }
            });
        }
    })

    persistence_channel.on('user_join', (data) => { })
}

window.persistence_socket = new Amber.Socket('/persistence')
