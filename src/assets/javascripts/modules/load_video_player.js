export function loadVideoPlayer() {

    if ($(".youtube-video").attr("src") == "") {
        return;
    }

    if (window.media_element) {
        window.media_element.setSrc($(".youtube-video").attr("src"));
    } else {

        $(".youtube-video").mediaelementplayer({
            // Configuration
            stretching: "fill",
            success: function (media) {
                window.media_element = media;
                // var isNative = /html5|native/i.test(media.rendererName);
                // media_element.muted = true;
                // var isYoutube = ~media.rendererName.indexOf('youtube');
                // if(!window.is_playing && !window.ended) {
                //     window.media_element.play();
                // }
                
                media.addEventListener("loadedmetadata", function (e) {
                    // console.log(e);
                });

                media.addEventListener('load', function (e) {
                    // console.log("load");
                    theater_channel.push("message_new", { event: "load", url: e.detail.target.getSrc(), room: window.room, name: window.name, userId: window.userId, time: window.media_element.getCurrentTime() });
                });

                media.addEventListener('playing', function () {
                    // console.log("playing");
                    window.is_playing = true;
                    window.ended = false;
                    theater_channel.push("message_new", { event: "playing", name: window.name, room: window.room, userId: window.userId, time: window.media_element.getCurrentTime() });
                });

                media.addEventListener('play', function () {
                    // console.log("play");
                    window.is_playing = true;
                    window.ended = false;
                    theater_channel.push("message_new", { event: "play", name: window.name, room: window.room, userId: window.userId, time: window.media_element.getCurrentTime() });
                });

                media.addEventListener('pause', function () {
                    // console.log("pause");
                    window.is_playing = false;
                    window.ended = true;
                    theater_channel.push("message_new", { event: "pause", name: window.name, room: window.room, userId: window.userId, time: window.media_element.getCurrentTime() });
                });

                media.addEventListener('ended', function () {
                    // console.log("ended");
                    window.is_playing = false;
                    window.ended = true;
                    theater_channel.push("message_new", { event: "ended", name: window.name, room: window.room, userId: window.userId, time: window.media_element.getCurrentTime() });
                });

                media.addEventListener('timeupdate', function (e) {
                    // console.log(e);
                    theater_channel.push("message_new", {event: "timeupdate", name: window.name, room: window.room, time: window.media_element.getCurrentTime(), userId: window.userId });
                });

                media.addEventListener('progress', function (e) {
                    // console.log("progress");
                    theater_channel.push("message_new", { event: "progress", name: window.name, room: window.room, time: window.media_element.getCurrentTime(), userId: window.userId });
                });

                media.addEventListener('waiting', function () {
                    // console.log("waiting");
                    theater_channel.push("message_new", { event: "waiting", name: window.name, room: window.room, time: window.media_element.getCurrentTime(), userId: window.userId });
                });

                media.addEventListener('canplay', function(e) {
                    console.log("canplay");
                    if(!window.is_playing && !window.ended) {
                        window.media_element.play();
                    }
                    theater_channel.push("message_new", {event: "canplay", name: window.name, room: window.room, time: window.media_element.getCurrentTime(), userId: window.userId});

                });

                media.addEventListener('seeking', function (e) {
                    console.log(e);
                    theater_channel.push("message_new", { event: "seeking", name: window.name, room: window.room, time: window.media_element.getCurrentTime(), userId: window.userId });
                });

                media.addEventListener('seeked', function (e) {
                    console.log(e);
                    theater_channel.push("message_new", { event: "seeked", name: window.name, room: window.room, time: window.media_element.getCurrentTime(), userId: window.userId });

                });

                media.addEventListener('volumechange', function (e) {
                    console.log(e);
                    
                });

                media.addEventListener("captionschange", function (e) {
                    console.log(e);
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


                $("#theater_volume")[0].addEventListener("input", function (e) {
                    window.media_element.setVolume(this.value);
                    theater_channel.push("message_new", { event: "volumechange", name: window.name, room: window.room, volume: this.value, userId: window.userId });
                });

                $("#theater_volume").val(0.5);
            }
        });

    }

}