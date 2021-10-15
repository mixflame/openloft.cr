import {setMediaBitrate, setMediaBitrates} from "./set_media_bitrates" 
import {toggleCamera, toggleMic} from "./toggle_camera_mic" 
import Amber from 'amber';

const JOIN_ROOM = "JOIN_ROOM";
const EXCHANGE = "EXCHANGE";
const REMOVE_USER = "REMOVE_USER";

// DOM Elements
let currentUser;
let localVideo;
let remoteVideoContainer;

// Objects
window.pcPeers = {};
window.userIds = {};
var polite = Math.random() < 0.5;
window.polite = polite;

var ignoreOffer = false;

var isNegotiating = {};

// Ice Credentials
const ice = { iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:45.79.48.199:5349", "turn:45.79.48.199:5349?transport=tcp"], username: "guest", credential: "password442" }] };
// const ice = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

window.disconnectVideo = function () {
    window.video_connected = false;
    window.currentUser = undefined;
    window.remoteVideoContainer = undefined;
    window.localstream = undefined;
    if (window.localVideo) {
        window.localVideo.srcObject = undefined;
        window.localVideo.muted = false;
    }
    handleLeaveSession();
}

window.connectVideo = function (videoIncluded = true) {

    window.video_connected = true;
    // setInterval(() => {
    //   $("video").each((i, e) => { if(e.duration != Infinity) $(e).parent().remove() })
    // }, 5000);
    currentUser = $("#current-user")[0].innerHTML;
    window.currentUser = currentUser;
    localVideo = $("#local-video")[0];
    window.localVideo = localVideo;
    remoteVideoContainer = $("#remote-video-container")[0];
    window.remoteVideoContainer = remoteVideoContainer;

    if (!navigator.mediaDevices) return;
    navigator.mediaDevices
        .getUserMedia({
            audio: {echoCancellation: true, noiseCancellation: true, autoGainControl: true},
            video: videoIncluded,
        })
        .then((stream) => {
            window.localstream = stream;
            window.localVideo.srcObject = stream;
            window.localVideo.muted = true;
            handleJoinSession();
        }).catch(() => {
            // alert("please allow camera access if you want to use video chat.")
            console.log("browser disallowed video.")
            handleJoinSession();
        });

    $("#local-video").click(function (e) {
        if (!window.dontLog) console.log("video clicked")

        // window.previous_height = $("#local-video").css("height");
        // window.previous_width = $("#local-video").css("width");
        // $("#local-video").css("height", "1024px");
        // $("#local-video").css("width", "1024px");

        if (document.pictureInPictureEnabled && !window.pip_mode) {
            var videos = $("#local-video");
            for (var i = 0; i < videos.length; i++) {
                const v = videos[i];
                try {
                    v.requestPictureInPicture()
                } catch (e) {
                    console.log("Couldn't enable PiP mode. " + e.message);
                }
            }
            window.pip_mode = true
        } else if (document.pictureInPictureEnabled && window.pip_mode) {
            try {
                document.exitPictureInPicture()
            } catch (e) {
                console.log("Couldn't disable PiP mode. " + e.message);
            }
            window.pip_mode = false
        }

    })

    $("#input").change(function () {
        var source_type = $("#input").val();
        if (source_type == "cam") {
            var type = $("#cameras").val();
            var audio_type = $("#audio_inputs").val();

            const videoConstraints = {};
            const audioConstraints = {echoCancellation: true, noiseCancellation: true, autoGainControl: true};
            if (type === '') {
                videoConstraints.facingMode = 'environment';
            } else {
                videoConstraints.deviceId = { exact: type };
            }

            audioConstraints.deviceId = { exact: audio_type };
            const constraints = {
                video: videoConstraints,
                audio: audioConstraints
            };

            navigator.mediaDevices
                .getUserMedia({
                    audio: {echoCancellation: true, noiseCancellation: true, autoGainControl: true},
                    video: true,
                })
                .then(function (stream) {
                    window.localstream = stream;
                    window.localVideo.srcObject = stream;
                    window.localVideo.muted = true;
                    for (const peerConnection in pcPeers) {
                        if (Object.hasOwnProperty.call(pcPeers, peerConnection)) {
                            const pc = pcPeers[peerConnection];
                            stream.getVideoTracks().forEach(function (track) {
                                var sender = pc.getSenders().find(function (s) {
                                    return s.track.kind == track.kind;
                                });
                                sender.replaceTrack(track);
                            });
                        }
                    }
                })
        } else if (source_type == "screen") {
            navigator.mediaDevices
                .getDisplayMedia({
                    audio: true,
                    video: true,
                })
                .then(function (stream) {
                    window.localstream = stream;
                    window.localVideo.srcObject = stream;
                    window.localVideo.muted = true;
                    for (const peerConnection in pcPeers) {
                        if (Object.hasOwnProperty.call(pcPeers, peerConnection)) {
                            const pc = pcPeers[peerConnection];
                            stream.getVideoTracks().forEach(function (track) {
                                var sender = pc.getSenders().find(function (s) {
                                    return s.track.kind == track.kind;
                                });
                                sender.replaceTrack(track);
                            });
                        }
                    }
                })
        }
    })


    $("#cameras").change(updateStreamSource);

    $("#audio_inputs").change(updateStreamSource);
}

export function updateStreamSource() {
    var type = $("#cameras").val();
    var audio_type = $("#audio_inputs").val();

    const videoConstraints = {};
    const audioConstraints = {echoCancellation: true, noiseCancellation: true, autoGainControl: true};
    if (type === '') {
        videoConstraints.facingMode = 'environment';
    } else {
        videoConstraints.deviceId = { exact: type };
    }

    audioConstraints.deviceId = { exact: audio_type };
    const constraints = {
        video: videoConstraints,
        audio: audioConstraints
    };


    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            window.localstream = stream;
            window.localVideo.srcObject = stream;
            window.localVideo.muted = true;
            for (const peerConnection in pcPeers) {
                if (Object.hasOwnProperty.call(pcPeers, peerConnection)) {
                    const pc = pcPeers[peerConnection];
                    stream.getVideoTracks().forEach(function (track) {
                        var sender = pc.getSenders().find(function (s) {
                            return s.track.kind == track.kind;
                        });
                        sender.replaceTrack(track);
                    });
                }
            }
        })
}

export function setupSession() {
    console.log("connected to /session")
    if (window.camera_socket.channels.length == 0) {
        window.camera_session = camera_socket.channel('session:' + window.room)
        window.camera_session.join()
    } else {
        window.camera_socket.channels = [];
        window.camera_session = camera_socket.channel('session:' + window.room)
        window.camera_session.join()
    }

    window.camera_session.on('message_new', (data) => {
        // if (!window.dontLog) console.log("received", data);
        if (data.from === currentUser) return;
        switch (data.type) {
            case JOIN_ROOM:
                return joinRoom(data);
            case EXCHANGE:
                if (data.to !== currentUser) return;
                return exchange(data);
            case REMOVE_USER:
                return removeUser(data);
            default:
                return;
        }
    })

    window.camera_session.on('user_join', (data) => {
        console.log("session user_join")
        console.log(data);
        broadcastData({
            type: JOIN_ROOM,
            from: currentUser,
            name: window.name,
            polite: window.polite,
        });
    })


}

export async function handleJoinSession() {
    if (!window.dontLog) console.log("joining session")
    if (window.camera_session == null || window.camera_session == undefined) {
        window.camera_socket = new Amber.Socket('/session')
        camera_socket.connect()
            .then(setupSession)
        window.camera_socket._reconnect = () => {
            clearTimeout(window.camera_socket.reconnectTimeout)
            window.camera_socket.reconnectTimeout = setTimeout(() => {
                window.camera_socket.reconnectTries++
                window.camera_socket.connect(window.camera_socket.params).then(() => {
                    // handleLeaveSession();
                    setupSession();
                    // handleJoinSession();
                });
                window.camera_socket._reconnect()
            }, window.camera_socket._reconnectInterval())
        }

    } else {
        broadcastData({
            type: JOIN_ROOM,
            from: currentUser,
            name: window.name
        });
    }
};

export function handleLeaveSession() {
    for (let user in pcPeers) {
        pcPeers[user].close();
    }
    pcPeers = {};
    userIds = {};

    if (remoteVideoContainer)
        remoteVideoContainer.innerHTML = "";


    // broadcastData({
    //   type: REMOVE_USER,
    //   name: window.name,
    //   from: currentUser,
    // });
};

export function joinRoom(data) {
    // polite checker
    // if all true, make self impolite
    // if all false, make self polite
    polite_arr.push(data.polite);
    var checker = polite_arr => polite_arr.every(v => v === "true")
    if (checker(polite_arr) == true) {
        polite = false;
    } else {
        checker = polite_arr => polite_arr.every(v => v === "false")
        if (checker(polite_arr) == true) {
            polite = true;
        }
    }
    createPC(data.from, true, data.name);
};

export function removeUser(data) {
    // if(data.name == window.name) {
    //   handleLeaveSession();
    //   handleJoinSession();
    //   return;
    // }
    if (!window.dontLog) console.log("removing user", data.from);
    let video = document.getElementById("remoteVideoContainer-" + data.from);
    video && video.remove();
    delete pcPeers[data.from];
    delete userIds[data.name];
};

export function createPC(userId, isOffer, n) {
    if (!window.dontLog) console.log("createPC " + userId + " isOffer: " + isOffer + " name: " + n)

    let pc = new RTCPeerConnection(ice);
    const element = document.createElement("video");
    $(element).click(function () {
        if (!window.dontLog) console.log("video clicked")
        if (document.pictureInPictureEnabled && !window.pip_mode) {
            var videos = $(this);
            for (var i = 0; i < videos.length; i++) {
                const v = videos[i];
                try {
                    v.requestPictureInPicture()
                } catch (e) {
                    console.log("Couldn't enable PiP mode. " + e.message);
                }
            }
            window.pip_mode = true
        } else if (document.pictureInPictureEnabled && window.pip_mode) {
            try {
                document.exitPictureInPicture()
            } catch (e) {
                console.log("Couldn't disable PiP mode. " + e.message);
            }
            window.pip_mode = false
        }


    })
    element.id = `video-${userId}`
    element.autoplay = "autoplay";
    element.playsInline = true;
    $(element).css("height", "100%");
    $(element).css("width", "100%");
    const container = document.createElement("div");
    const p = document.createElement("p");
    p.innerHTML = n;
    container.appendChild(p);
    container.appendChild(element);
    const video_mute = document.createElement("button");
    video_mute.id = `video-mute-${userId}`
    $(video_mute).prop("user_id", userId);
    $(video_mute).html("Stop cam")
    $(video_mute).addClass("btn btn-secondary btn-sm d-inline mr-1 mb-1");
    $(video_mute).click(function (e) {
        var el = e.currentTarget;
        toggleCamera($("#video-" + $(el).prop("user_id"))[0].srcObject, video_mute);
    })
    const audio_mute = document.createElement("button");
    audio_mute.id = `audio-mute-${userId}`
    $(audio_mute).prop("user_id", userId);
    $(audio_mute).html("Mute")
    $(audio_mute).addClass("btn btn-secondary btn-sm d-inline mr-1 mb-1");
    $(audio_mute).click(function (e) {
        var el = e.currentTarget;
        toggleMic($("#video-" + $(el).prop("user_id"))[0].srcObject, audio_mute);
    })
    container.append(video_mute);
    container.append(audio_mute);

    container.id = `remoteVideoContainer-${userId}`;
    container.style = "float: left; display: inline; width: 25%; height: 25%; padding-left: 10px;"
    remoteVideoContainer.appendChild(container);

    $(container).addClass(`remoteVideoContainer-${userId}`);
    $(container).hide();
    $(`#video-${userId}`).on("play", function (e) {
        $(`#remoteVideoContainer-${userId}`).show();
    })

    // console.log(`adding ${userId} to pcPeers`)
    pcPeers[userId] = pc;
    userIds[n] = userId;

    if (window.localstream) {
        for (const track of window.localstream.getTracks()) {
            pc.addTrack(track, window.localstream);
        }
    }

    if (isOffer) {
        window.makingOffer = true;
        pc
            .createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
            .then((offer) => {
                offer.sdp = setMediaBitrates(offer.sdp);
                return pc.setLocalDescription(offer);
            })
            .then(() => {
                broadcastData({
                    type: EXCHANGE,
                    from: currentUser,
                    to: userId,
                    sdp: JSON.stringify(pc.localDescription),
                    name: name
                });
            }).then(() => {
                window.makingOffer = false;
            })
            .catch(e => {
                logError(e)
                if (pc.restartIce != undefined) {
                    console.log("restarting ice");
                    pc.restartIce();
                }
            });
    }

    pc.onicecandidate = (event) => {
        event.candidate &&
            broadcastData({
                type: EXCHANGE,
                from: currentUser,
                to: userId,
                candidate: JSON.stringify(event.candidate),
                name: name
            });
    };

    pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
            element.srcObject = event.streams[0];
        } else {
            let inboundStream = new MediaStream(event.track);
            element.srcObject = inboundStream;
        }
    };

    pc.onaddstream = function (e) {
        if (e.srcElement.iceConnectionState === 'connected' &&
            e.srcElement.iceGatheringState === 'complete') {
            // attach to video-element
            $(container).show();
        }
    };

    pc.onconnectionstatechange = function (event) {
        console.log(`peerconnection of userId ${userId} connectionstate changed to ${pc.connectionState}`)
        switch (pc.connectionState) {
            case "connected":
                // console.log(`connection state changed to connected userId: ${userId}`)
                // The connection has become fully connected
                // $(`#remoteVideoContainer-${userId}`).show();
                // $("video").each((i, e) => { if(e.duration != Infinity) $(e).parent().remove() })

                break;
            case "disconnected":
            case "failed":
                // console.log(`connection state changed to failed userId: ${userId}`)
                // One or more transports has terminated unexpectedly or in an error
                // $("video").each((i, e) => { if(e.duration != Infinity) $(e).parent().remove() })
                $(container).remove();
                break;
            case "closed":
                // The connection has been closed
                // $("video").each((i, e) => { if(e.duration != Infinity) $(e).parent().remove() })
                break;
        }
    }

    pc.oniceconnectionstatechange = () => {
        console.log(`peerconnection of userId ${userId} iceconnectionstate changed to ${pc.iceConnectionState}`)
        if (pc.iceConnectionState == "disconnected") {
            // if(!window.dontLog) console.log("Disconnected:", userId);

            // $("video").each((i, e) => { if(e.duration != Infinity) $(e).parent().remove() })
            if (pc.restartIce != undefined) {
                console.log("restarting ice because iceConnectionState is disconnected");
                pc.restartIce();
            }
            // $("video").each(function(i, e){
            //   if($(e)[0].duration != Infinity) {
            //     $(e).remove();
            //   }
            // })
            // broadcastData({
            //   type: REMOVE_USER,
            //   from: userId,
            //   name: name
            // });
        } else if (pc.iceConnectionState == "failed") {
            // console.log("connection failed")

            // $("video").each((i, e) => { if(pcPeers[e.id.split("-")[1]].iceConnectionState == "failed") $(e).parent().remove() })
            if (pc.restartIce != undefined) {
                console.log("restarting ice because iceConnectionState is failed");
                pc.restartIce();
            }
            // ghost remover

        } else if (pc.iceConnectionState == "connected") {
            // $(`#remoteVideoContainer-${userId}`).show();
        }
    };

    pc.onsignalingstatechange = (e) => { // Workaround for Chrome: skip nested negotiations
        isNegotiating[pc] = (pc.signalingState != "stable");
    }

    pc.onnegotiationneeded = function () {
        if (isNegotiating[pc]) {
            console.log("SKIP nested negotiations");
            return;
        }
        isNegotiating[pc] = true;
        if (!window.dontLog) console.log('negotiationstarted');
        window.makingOffer = true;
        pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true }).then(function (offer) {
            offer.sdp = setMediaBitrate(offer.sdp);
            return pc.setLocalDescription(offer);
        }).then(function () {
            if (!window.dontLog) console.log('negotiation signal sent');
            broadcastData({
                type: EXCHANGE,
                from: currentUser,
                to: userId,
                sdp: JSON.stringify(pc.localDescription),
                name: name
            });
        }).then(() => {
            window.makingOffer = false;
        })
            .catch(e => {
                logError(e);

                // if(pc.restartIce != undefined) { console.log("restarting ice because of error in onnegotationeeded"); pc.restartIce(); }
            });
    }

    return pc;
};

export function exchange(data) {
    let pc;

    if (!pcPeers[data.from]) {
        pc = createPC(data.from, false, data.name);
    } else {
        pc = pcPeers[data.from];
    }

    if (data.candidate) {
        pc.addIceCandidate(new RTCIceCandidate(JSON.parse(data.candidate)))
            .then(() => console.log("Ice candidate added"))
            .catch(e => {
                logError(e);

                if (pc.restartIce != undefined) {
                    console.log("restarting ice because of error adding ice candidate");
                    pc.restartIce();
                }
            });
    }

    if (data.sdp) {
        const offerCollision = (data.sdp.type == "offer") &&
            (window.makingOffer || pc.signalingState != "stable");
        ignoreOffer = !polite && offerCollision;
        if (ignoreOffer) {
            return;
        }
        const sdp = JSON.parse(data.sdp);
        pc.setRemoteDescription(new RTCSessionDescription(sdp))
            .then(() => {
                if (sdp.type === "offer") {
                    pc.createAnswer()
                        .then((answer) => {
                            answer.sdp = setMediaBitrate(answer.sdp);
                            return pc.setLocalDescription(answer);
                        })
                        .then(() => {
                            broadcastData({
                                type: EXCHANGE,
                                from: currentUser,
                                to: data.from,
                                sdp: JSON.stringify(pc.localDescription),
                                name: data.name
                            });
                        }).catch((e) => {
                            logError(e);
                            if (pc.restartIce != undefined) {
                                console.log("restarting ice because of error creating answer");
                                pc.restartIce();
                            }
                        });
                }
            }).catch(e => {
                logError(e);
                // if(pc.restartIce != undefined) { console.log("restarting ice because of error setting remote description"); pc.restartIce(); }
            });
    }
};

export function broadcastData(data) {
    if (!window.dontLog) console.log("broadcast data")
    /**
     * Add CSRF protection: https://stackoverflow.com/questions/8503447/rails-how-to-add-csrf-protection-to-forms-created-in-javascript
     */
    const csrfToken = document.querySelector("[name=_csrf]").content;
    const headers = new Headers({
        "content-type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
    });

    data["room"] = room;


    fetch("/sessions", {
        method: "POST",
        body: JSON.stringify(data),
        headers,
    });
};

export function logError(error) {
    if (!ignoreOffer) {
        console.log(error.message);
    }

};

export function gotDevices(mediaDevices) {
    var select = $("#cameras")[0];
    var audio_select = $("#audio_inputs")[0];
    select.innerHTML = '';
    select.appendChild(document.createElement('option'));
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === 'videoinput') {
            const option = document.createElement('option');
            option.value = mediaDevice.deviceId;
            const label = mediaDevice.label || `Camera ${count++}`;
            const textNode = document.createTextNode(label);
            option.appendChild(textNode);
            select.appendChild(option);
        } else {
            const option = document.createElement('option');
            option.value = mediaDevice.deviceId;
            const label = mediaDevice.label || `Audio Input ${count++}`;
            const textNode = document.createTextNode(label);
            option.appendChild(textNode);
            audio_select.appendChild(option);
        }
    });

}