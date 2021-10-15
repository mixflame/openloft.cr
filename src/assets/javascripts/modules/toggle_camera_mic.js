export function toggleMic(stream, id) { // stream is your local WebRTC stream
    var audioTracks = stream.getAudioTracks();
    var muted;
    for (var i = 0, l = audioTracks.length; i < l; i++) {
        audioTracks[i].enabled = !audioTracks[i].enabled;
        muted = !audioTracks[i].enabled;
        if (muted) {
            $(id).html("Unmute");
        } else {
            $(id).html("Mute");
        }
    }
}

export function toggleCamera(stream, id) { // stream is your local WebRTC stream
    var videoTracks = stream.getVideoTracks();
    var muted;
    for (var i = 0, l = videoTracks.length; i < l; i++) {
        videoTracks[i].enabled = !videoTracks[i].enabled;
        muted = !videoTracks[i].enabled;
        if (muted) {
            $(id).html("Start cam");
        } else {
            $(id).html("Stop cam");
        }
    }
}