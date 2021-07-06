import Amber from 'amber';

var urlParams = new URLSearchParams(window.location.search);
var room = urlParams.get('room');

window.setuptheater = () => {
    console.log("connected to /theater")
    if (window.theater_socket.channels.length == 0) {
        window.theater_channel = theater_socket.channel('theater:' + window.room)
        window.theater_channel.join()
        loadVideoPlayer();
    }
    if (!window.dontLog) console.log("Connected to theater channel");



    theater_channel.on('message_new', (data) => {
        console.log(data);
        if (data["room"] != window.room) {
            return;
        }
        if (data["name"] == window.name) {
            return;
        }
            if (data["event"] == "play") {
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    console.log("setting time");
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
                if(!window.is_playing) {
                    window.media_element.play();
                }
            } else if (data["event"] == "playing") {
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    console.log("setting time");
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
                if(!window.is_playing) {
                    window.media_element.play();
                }
            } else if (data["event"] == "pause") {
                window.media_element.pause();
            } else if (data["event"] == "ended") {
                window.media_element.pause();
                
            } else if (data["event"] == "timeupdate") {
                console.log("got time update");
                // if(window.is_playing && !window.ended) {
                //     window.media_element.pause();
                // }
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    console.log("setting time");
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
                if(!window.is_playing && !window.ended) {
                    window.media_element.play();
                }
                // window.media_element.play();
            } else if (data["event"] == "progress") {
                if(!window.is_playing && !window.ended) {
                    window.media_element.pause();
                }
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
                if(!window.is_playing && !window.ended) {
                    window.media_element.play();
                }
                
            } else if (data["event"] == "waiting") {
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
            } else if (data["event"] == "canplay") {
                if(!window.is_playing && !window.ended) {
                    window.media_element.play();
                }
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
            } else if (data["event"] == "seeking") {
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
            } else if (data["event"] == "seeked") {
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
            } else if (data["event"] == "volumechange") {
                $("#theater_volume").val(data["volume"]);
                window.media_element.setVolume(data["volume"]);
            } else if (data["event"] == "captionschange") {
                if(parseFloat(data["time"]) > parseFloat(window.media_element.getCurrentTime())) {
                    window.media_element.setCurrentTime(data["time"]);
                    window.theater_load_time = data["time"];
                }
            } else if (data["event"] == "mute") {
                window.media_element.muted = true;
            }  else if (data["event"] == "unmute") {
                window.media_element.muted = false;
            }
            
            if (data["event"] == "load") {
                console.log('loading video');




                $(".youtube-video").attr("src", data["url"]);

                if (window.media_element) {
                    window.media_element.setSrc(data["url"]);
                } else {

                    $(".youtube-video").mediaelementplayer({
                        // Configuration
                        stretching: "fill",
                        success: function (media) {
                            window.media_element = media;
                            // var isNative = /html5|native/i.test(media.rendererName);
                            media_element.muted = true;

                            // var isYoutube = ~media.rendererName.indexOf('youtube');
                            if(!window.is_playing && !window.ended) {
                                window.media_element.play();
                            }


                            media.addEventListener("loadedmetadata", function (e) {
                                // console.log(e);
                            });

                            media.addEventListener('load', function (e) {
                                // console.log("load");
                                theater_channel.push("message_new", { event: "load", url: e.detail.target.getSrc(), room: window.room, name: window.name, userId: window.userId });
                            });

                            media.addEventListener('playing', function () {
                                // console.log("playing");
                                window.is_playing = true;
                                window.ended = false;
                                theater_channel.push("message_new", { event: "playing", name: window.name, room: window.room, userId: window.userId, time: e.detail.target.getCurrentTime() });
                            });

                            media.addEventListener('play', function () {
                                // console.log("play");
                                window.is_playing = true;
                                window.ended = false;
                                theater_channel.push("message_new", { event: "play", name: window.name, room: window.room, userId: window.userId, time: e.detail.target.getCurrentTime() });
                            });

                            media.addEventListener('pause', function () {
                                // console.log("pause");
                                window.is_playing = false;
                                window.ended = true;
                                theater_channel.push("message_new", { event: "pause", name: window.name, room: window.room, userId: window.userId, time: e.detail.target.getCurrentTime() });
                            });

                            media.addEventListener('ended', function () {
                                // console.log("ended");
                                window.is_playing = false;
                                window.ended = true;
                                theater_channel.push("message_new", { event: "ended", name: window.name, room: window.room, userId: window.userId, time: e.detail.target.getCurrentTime() });
                            });

                            media.addEventListener('timeupdate', function (e) {
                                // console.log(e);
                                theater_channel.push("message_new", { event: "timeupdate", name: window.name, room: window.room, time: e.detail.target.getCurrentTime(), userId: window.userId  });
                            });

                            media.addEventListener('progress', function (e) {
                                // console.log("progress");
                                theater_channel.push("message_new", { event: "progress", name: window.name, room: window.room, time: e.detail.target.getCurrentTime(), userId: window.userId });
                            });

                            media.addEventListener('waiting', function () {
                                // console.log("waiting");
                                theater_channel.push("message_new", { event: "waiting", name: window.name, room: window.room, userId: window.userId, time: e.detail.target.getCurrentTime() });
                            });

                            media.addEventListener('canplay', function () {
                                if(!window.is_playing && !window.ended) {
                                    window.media_element.play();
                                }
                            });

                            media.addEventListener('seeking', function (e) {
                                // console.log(e);
                                theater_channel.push("message_new", { event: "seeking", name: window.name, room: window.room, time: e.detail.target.getCurrentTime(), userId: window.userId });
                            });

                            media.addEventListener('seeked', function (e) {
                                // console.log(e);
                                theater_channel.push("message_new", { event: "seeked", name: window.name, room: window.room, time: e.detail.target.getCurrentTime(), userId: window.userId });

                            });

                            media.addEventListener('volumechange', function (e) {
                                // console.log("volumechange");
                            });

                            media.addEventListener("captionschange", function () {
                                // console.log("captionschange");
                                theater_channel.push("message_new", { event: "seeked", name: window.name, room: window.room, time: e.detail.target.getCurrentTime(), userId: window.userId });
                            });

                            $("#theater_play").click(function () {
                                window.media_element.play();
                            });

                            $("#theater_pause").click(function () {
                                window.media_element.pause();
                            });

                            $("#theater_mute").click(function () {
                                window.media_element.muted = true;
                                theater_channel.push("message_new", { event: "mute", name: window.name, room: window.room, time: window.media_element.getCurrentTime(), userId: window.userId });
                            });

                            $("#theater_unmute").click(function () {
                                window.media_element.muted = false;
                                theater_channel.push("message_new", { event: "unmute", name: window.name, room: window.room, time: window.media_element.getCurrentTime(), userId: window.userId });
                            });

                            $("#theater_volume")[0].addEventListener("input", function () {
                                window.media_element.setVolume(this.value);
                                theater_channel.push("message_new", { event: "volumechange", name: window.name, room: window.room, volume: this.value, userId: window.userId });
                            });

                            $("#theater_volume").val(0.5);
                        }
                    });



                    return;
                }


            }
    })


    theater_channel.on('user_join', (data) => {
        console.log(data);
        window.media_element.setSrc(data.url);
        window.theater_load_time = data.time;
        window.media_element.setCurrentTime(window.theater_load_time);
        if(!window.is_playing && !window.ended) {
            window.media_element.play();
        }
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