import Amber from 'amber';

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

var uuid = uuidv4();

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');


window.persistence_socket = new Amber.Socket('/persistence')
persistence_socket.connect()
    .then(() => {
        console.log("connected to /persistence")
        window.persistence_channel = persistence_socket.channel('persistence:' + window.room + "_" + uuid)
        window.persistence_channel.join()
        if (!window.dontLog) console.log("Connected to persistence channel");
        $("#status").text("loading canvas");
        // this.perform('connected', {id: uuid});

        persistence_channel.push("message_new", {connected: true});

        persistence_channel.on('message_new', (data) => {
            // handle new message here
            console.log(data);
            var count = $(data['canvas']).length;
            var packets_length = data['packets'];
            window.total = 0;
            if (count == 0) {
                window.redraw(true, true);
                // window.redraw(false, false);
                setTimeout(function () {
                    $("#status").text("canvas loaded");
                    window.disabled = false;
                    $("#join-button").click();
                    setTimeout(window.start_pinging, 1000);
                }, 1000);
            } else {

                data['canvas'].forEach(function (json, index) {
                    var point = JSON.parse(json);
                    window.addClick(point["x"], point["y"], point["dragging"], true, point["name"], point["color"], point['size'], point['text'], point['path'], point['line_join'], point['shape_type'], point['shape_width'], point['shape_height'], point['shape_fill'], point["shape_angle"]);
                    // window.redraw(true, false);
                    window.total = window.total + 1;
                    if (packets_length == window.total) {
                        window.redraw(true, true);
                        setTimeout(function () {
                            $("#status").text("canvas loaded");
                            window.start_pinging();
                            window.disabled = false;
                            $("#join-button").click();
                            setTimeout(window.start_pinging, 1000);
                        }, 1000);
                    } else {
                        $("#status").text("canvas loading... " + index + "/" + count);
                    }
                });
            }
        })

        persistence_channel.on('user_join', (data) => { })
    })