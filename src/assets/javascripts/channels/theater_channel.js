import Amber from 'amber';

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');

window.setuptheater = () => {
    console.log("connected to /theater")
    if (window.theater_socket.channels.length == 0) {
        window.theater_channel = theater_socket.channel('theater:' + window.room)
        window.theater_channel.join()
    }
    if (!window.dontLog) console.log("Connected to theater channel");



    theater_channel.on('message_new', (data) => {
        console.log(data);
        if(data["room"] != window.room) {
            return;
        }
        if(data["name"] == window.name) {
            return;
        }
        if (data["event"] == "load") {
            console.log('loading video');
            $('.nav-tabs a[href="#theater_tab"]').tab('show');

            $(".youtube-video").attr("src", data["url"]);

            $(".youtube-video").mediaelementplayer({
                // Configuration
                stretching: "fill",
                success: function (media) {
                    window.media_element = media;
                    var isNative = /html5|native/i.test(media.rendererName);

                    var isYoutube = ~media.rendererName.indexOf('youtube');

                    media.addEventListener("loadedmetadata", function (e) {
                        console.log(e);
                    });

                    media.addEventListener('load', function (e) {
                        console.log("load");
                        theater_channel.push("message_new", { event: "load", url: e.detail.target.getSrc(), room: window.room, name: window.name });
                    });

                    media.addEventListener('playing', function () {
                        console.log("playing");
                        theater_channel.push("message_new", { event: "playing", name: window.name, room: window.room });
                    });

                    media.addEventListener('play', function () {
                        console.log("play");
                        theater_channel.push("message_new", { event: "play", name: window.name, room: window.room });
                    });

                    media.addEventListener('pause', function () {
                        console.log("pause");
                        theater_channel.push("message_new", { event: "pause", name: window.name, room: window.room });
                    });

                    media.addEventListener('ended', function () {
                        console.log("ended");
                        theater_channel.push("message_new", { event: "ended", name: window.name, room: window.room });
                    });

                    media.addEventListener('timeupdate', function (e) {
                        console.log(e);
                        // theater_channel.push("message_new", { event: "timeupdate", name: window.name, room: window.room, time: e.detail.target.getCurrentTime() });
                    });

                    media.addEventListener('progress', function (e) {
                        console.log("progress");
                        theater_channel.push("message_new", { event: "progress", name: window.name, room: window.room, time: e.detail.target.getCurrentTime() });
                    });

                    media.addEventListener('waiting', function () {
                        console.log("waiting");
                        theater_channel.push("message_new", { event: "waiting", name: window.name, room: window.room });
                    });

                    // media.addEventListener('canplay', function () {
                    //     console.log("canplay");
                    //     theater_channel.push("message_new", { event: "canplay", name: window.name, room: window.room });
                    // });

                    media.addEventListener('seeking', function (e) {
                        console.log(e);
                        theater_channel.push("message_new", { event: "seeking", name: window.name, room: window.room, time: e.detail.target.getCurrentTime() });
                    });

                    media.addEventListener('seeked', function (e) {
                        console.log(e);
                        theater_channel.push("message_new", { event: "seeked", name: window.name, room: window.room, time: e.detail.target.getCurrentTime() });

                    });

                    media.addEventListener('volumechange', function (e) {
                        console.log("volumechange");
                        // theater_channel.push("message_new", { event: "volumechange", name: window.name, room: window.room, volume: e.detail.target.getVolume() });
                    });

                    media.addEventListener("captionschange", function () {
                        console.log("captionschange");
                        theater_channel.push("message_new", { event: "seeked", name: window.name, room: window.room, time: e.detail.target.getCurrentTime() });
                    });

                    $("#theater_play").click(function() {
                        window.media_element.play();
                    });
            
                    $("#theater_pause").click(function() {
                        window.media_element.pause();
                    });
            
                    $("#theater_mute").click(function() {
                        window.media_element.muted = true;
                    });
            
                    $("#theater_unmute").click(function() {
                        window.media_element.muted = false;
                    });
            
                    $("#theater_volume")[0].addEventListener("input", function() {
                        window.media_element.setVolume(this.value);
                    });
                }
            });


        
            return;
        } 
        if(window.media_element == null) {
            return;
        }
        
        if (data["event"] == "play") {

            window.media_element.play();

        } else if (data["event"] == "pause") {
            window.media_element.pause();
        } else if (data["event"] == "ended") {
            window.media_element.pause();
        } else if (data["event"] == "timeupdate") {
            // window.media_element.setCurrentTime(data["time"]);
        } else if (data["event"] == "progress") {
            window.media_element.setCurrentTime(data["time"]);
        } else if (data["event"] == "waiting") {
            window.media_element.setCurrentTime(data["time"]);
        } else if (data["event"] == "canplay") {
            window.media_element.setCurrentTime(data["time"]);
        } else if (data["event"] == "seeking") {
            window.media_element.setCurrentTime(data["time"]);
        } else if (data["event"] == "seeked") {
            window.media_element.setCurrentTime(data["time"]);
        } else if (data["event"] == "volumechange") {
            // window.media_element.setVolume(data["volume"]);
        } else if (data["event"] == "captionschange") {
            window.media_element.setCurrentTime(data["time"]);
        }

    })

    theater_channel.on('user_join', (data) => {
        console.log(data);

    });

}

window.theater_socket = new Amber.Socket('/theater')
theater_socket.connect()
    .then(setuptheater)
window.theater_socket._reconnect = () => {
    clearTimeout(window.theater_socket.reconnectTimeout)
    window.theater_socket.reconnectTimeout = setTimeout(() => {
        window.theater_socket.reconnectTries++
        window.theater_socket.connect(window.theater_socket.params).then(setuptheater);
        window.theater_socket._reconnect()
    }, window.theater_socket._reconnectInterval())
}