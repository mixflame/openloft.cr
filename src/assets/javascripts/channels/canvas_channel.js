import Amber from 'amber';

function arrayRemove(arr, value) {

    return arr.filter(function (ele) {
        return ele != value;
    });
}

window.setupCanvas = () => {
    console.log("connected to /canvas")
    console.log("canvas room: " + window.room);
    if(window.canvas_socket.channels.length == 0){
        window.canvas_channel = window.canvas_socket.channel('canvas:' + window.room)
        window.canvas_channel.join()
    } else {
        window.canvas_socket.channels = [];
        window.canvas_channel = window.canvas_socket.channel('canvas:' + window.room)
        window.canvas_channel.join()
    }

    window.start_pinging();
    setInterval(window.start_pinging, 5000);

    if (!window.dontLog) console.log("Connected to Canvas channel!");

    window.canvas_channel.on('message_new', (data) => {
        // console.log(data);
        if (data["clear"] == true) {
            if (!window.dontLog) console.log("clearing");
            window.mpLayerOrder = [];
            window.mpClickHash = {};
            window.mpNameHash = {};
            window.context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
            window.context.fillStyle = "#FFFFFF";
            window.context.fillRect(0, 0, 1180, 690);
            var destCtx = window.bgCanvas.getContext('2d');
            destCtx.drawImage(window.canvas, 0, 0);
            return false;
        }

        if (data['undo'] == true) {
            // set values to backups
            window.mpNameHash = window.backupMpNameHash;
            window.mpLayerOrder = window.backupMpLayerOrder;
            window.mpClickHash = window.backupMpClickHash;
            // get top layer number
            var topLayerNum = window.mpNameHash[data['name']];
            if (topLayerNum == null || topLayerNum == undefined) return;
            // console.log(`deleting ${data['name']}'s ${topLayerNum}`)
            // decrement layer in name hash
            window.mpNameHash[data['name']] = window.mpNameHash[data['name']] - 1;
            // get top layer index
            var topLayerIndex = window.mpLayerOrder.indexOf(data['name'] + "_" + topLayerNum);

            // console.log(`deleting ${topLayerIndex}`)
            // console.log(window.mpLayerOrder);

            // remove from layer order
            window.mpLayerOrder.splice(topLayerIndex, 1);
            // window.mpLayerOrder = arrayRemove(window.mpLayerOrder, data['name'] + "_" + topLayerNum);
            // console.log(window.mpLayerOrder);

            // get top layer
            var topLayer = window.mpClickHash[data['name'] + "_" + topLayerNum];
            // console.log(topLayer);

            // delete top layer
            delete window.mpClickHash[data['name'] + "_" + topLayerNum];

            // set backups back to modified version
            window.backupMpNameHash = window.mpNameHash;
            window.backupMpLayerOrder = window.mpLayerOrder;
            window.backupMpClickHash = window.mpClickHash;

            // clear bg canvas
            var destCtx = window.bgCanvas.getContext('2d');
            destCtx.clearRect(0, 0, destCtx.canvas.width, destCtx.canvas.height); // Clears the canvas
            destCtx.fillStyle = "#FFFFFF";
            destCtx.fillRect(0, 0, 0.60 * screen.width, 0.60 * screen.height);

            // redraw
            window.redraw(false, true);
            // window.redraw(false, true);
            window.edits = window.edits - 1;

            $("#undo").prop("disabled", false);
            return false;
        }

        // if(data['undo'] == true) {
        //   window.mpNameHash = {};
        //   window.mpLayerOrder = [];
        //   window.mpClickHash = {};
        //   window.backupMpNameHash = {};
        //   window.backupMpClickHash = {};
        //   window.backupMpLayerOrder = [];
        //   var context = window.canvas.getContext('2d');
        //   context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
        //   context.fillStyle = "#FFFFFF";
        //   context.fillRect(0, 0,  0.60 * screen.width,  0.60 * screen.height);
        //   // clear bg canvas
        //   var destCtx = window.bgCanvas.getContext('2d');
        //   destCtx.clearRect(0, 0, destCtx.canvas.width, destCtx.canvas.height); // Clears the canvas
        //   destCtx.fillStyle = "#FFFFFF";
        //   destCtx.fillRect(0, 0,  0.60 * screen.width,  0.60 * screen.height);
        //   window.persistence_channel.push("message_new", {connected: true});
        //   window.redraw(false, true);
        // }

        if (data["ping"]) {
            window.last_ping[data['name']] = Date.now();
            setTimeout(() => {
                if (window.last_ping[data['name']] < Date.now() - 5000)
                    $(".online-" + data['name']).remove()
            }, 6000);
            if (!window.nicks.includes(data["name"])) {
                window.nicks.push(data["name"]);

                    var ding = new Audio("/ding.wav")
                    ding.volume = 0.05;
                    ding.play().catch((e) => {
                    console.log(e.message)
                    })
            }
            if ($(".online-" + data['name']).length == 0) {
                $("#connected_users").html($("#connected_users").html() + `<li class='online-${data['name']}'>${data['name']}</li>`)

                var parent = $("#connected_users")[0],
                    // take items (parent.children) into array
                    itemsArray = Array.prototype.slice.call(parent.children);

                // sort items in array by custom criteria
                itemsArray.sort(function (a, b) {
                    // inner text suits best (even when formated somehow)
                    if (a.innerText < b.innerText) return -1;
                    if (a.innerText > b.innerText) return 1;
                    return 0;
                });

                // reorder items in the DOM
                itemsArray.forEach(function (item) {
                    // one by one move to the end in correct order
                    parent.appendChild(item);
                });
            } else {
                var mousedown_name = data['name'];
                // $(".online-" + mousedown_name).remove();
                $(".online-" + mousedown_name).replaceWith('<li class="online-'+ mousedown_name +'">' + mousedown_name + '</li>')
            }
            return;
        }

        // if (!data["mouseUp"]) {
            if (data["name"] != window.name && !window.locked) {
                window.addClick(data["x"], data["y"], data["dragging"], true, data["name"], data["color"], data['size'], data['text'], data['path'], data['line_join'], data['shape_type'], data['shape_width'], data['shape_height'], data['shape_fill'], data["shape_angle"], data["brush_style"], data["count"]);
                if (window.getTotalSizeOfCanvas() > 2000) {
                    window.redraw(true, true);
                    // window.redraw(false, false);
                } else {
                    window.redraw(true, false);
                }


            }

            window.mouseDown(data["name"], data["color"], data['size']);
        // }
    })

    window.canvas_channel.on('user_join', (data) => {
        console.log("user_join canvas: " + data);
    })

}

window.canvas_socket = new Amber.Socket('/canvas')
window.canvas_socket.connect()
    .then(setupCanvas)
window.canvas_socket._reconnect = () => {
    clearTimeout(window.canvas_socket.reconnectTimeout)
    window.canvas_socket.reconnectTimeout = setTimeout(() => {
      window.canvas_socket.reconnectTries++
      window.canvas_socket.connect(window.canvas_socket.params).then(setupCanvas);
      window.canvas_socket._reconnect()
    }, window.canvas_socket._reconnectInterval())
  }

