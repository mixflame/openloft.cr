/*  Livepixel - Multiplayer paint app
    Copyright (C) 2019 Jonathan Silverman

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// Created by https://www.mindynamics.com

// window.audioBandwidth = 25;
// window.videoBandwidth = 128;
// function setBandwidth(sdp) {
//     sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + window.audioBandwidth + '\r\n');
//     sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + window.videoBandwidth + '\r\n');
//     return sdp;
// }


import Amber from 'amber';

function scaledPositionX (x) {
  let scaleFactor = (window.canvas.width / window.canvas.clientWidth);
  return scaleFactor * x;
}
function scaledPositionY (y) {
  let scaleFactor = (window.canvas.height / window.canvas.clientHeight);
  return scaleFactor * y;
}

var urlParams = new URLSearchParams(window.location.search);
window.room = urlParams.get('room');

function setMediaBitrates(sdp) {
    return setMediaBitrate(setMediaBitrate(sdp, "video", 96), "audio", 50);
  }
   
  function setMediaBitrate(sdp, media, bitrate) {
    var lines = sdp.split("\n");
    var line = -1;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf("m="+media) === 0) {
        line = i;
        break;
      }
    }
    if (line === -1) {
      console.debug("Could not find the m line for", media);
      return sdp;
    }
    console.debug("Found the m line for", media, "at line", line);
   
    // Pass the m line
    line++;
   
    // Skip i and c lines
    while(lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
      line++;
    }
   
    // If we're on a b line, replace it
    if (lines[line].indexOf("b") === 0) {
      console.debug("Replaced b line at line", line);
      lines[line] = "b=AS:"+bitrate;
      return lines.join("\n");
    }
    
    // Add a new b line
    console.debug("Adding new b line before line", line);
    var newLines = lines.slice(0, line)
    newLines.push("b=AS:"+bitrate)
    newLines = newLines.concat(lines.slice(line, lines.length))
    return newLines.join("\n")
  }
  
  
  function toggleMic(stream, id) { // stream is your local WebRTC stream
    var audioTracks = stream.getAudioTracks();
    var muted;
    for (var i = 0, l = audioTracks.length; i < l; i++) {
      audioTracks[i].enabled = !audioTracks[i].enabled;
      muted = !audioTracks[i].enabled;
      if(muted) {
        $(id).html("Unmute");
      } else {
        $(id).html("Mute");
      }
    }
  }
  
  function toggleCamera(stream, id) { // stream is your local WebRTC stream
    var videoTracks = stream.getVideoTracks();
    var muted;
    for (var i = 0, l = videoTracks.length; i < l; i++) {
      videoTracks[i].enabled = !videoTracks[i].enabled;
      muted = !videoTracks[i].enabled;
      if(muted) {
        $(id).html("Start cam");
      } else {
        $(id).html("Stop cam");
      }
    }
  }
  
  import { renderGif } from '@giphy/js-components'
  import { GiphyFetch } from '@giphy/js-fetch-api'
  
  // create a GiphyFetch with your api key
  // apply for a new Web SDK key. Use a separate key for every platform (Android, iOS, Web)
  window.gf = new GiphyFetch('ZTlXzVf7OBMC3FDNZhYXZDk8mPPLerCA')
  
  // const vanillaJSGif = async (mountNode: HTMLElement) => {
  //     // render a single gif
  //     const { data: gif1 } = await gf.gif('fpXxIjftmkk9y')
  //     renderGif({ gif: gif1, width: 300 }, mountNode)
  // }
  
  import { EmojiButton } from '@joeattardi/emoji-button';
  
  window.edits = 0;
  
  const pointInPolygon = function (x, y, polygon) {
    // from https://github.com/substack/point-in-polygon
    let inside = false
  
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i][0]
      let yi = polygon[i][1]
      let xj = polygon[j][0]
      let yj = polygon[j][1]
      let intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
  
    return inside
  }
  
  const floodFill = function(context, x, y, color) {
    // const highest_layer = window.backupMpNameHash[window.name]
    var max;
    if(window.backupMpLayerOrder.length > 0)
      max = window.backupMpLayerOrder.length - 1;
    else
      max = 0;
    for(var z = max; z >= 0; --z) {
      // var path = [];
      var path = [];
        // console.log(z);
        if(window.backupMpClickHash[window.backupMpLayerOrder[z]]){
          if(window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickX"]) {      
            for(var i = 0; i < window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickX"].length; i++) {        
              var mx = window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickX"][i];
              var my = window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickY"][i];
              if(mx && my){
                path.push([mx, my]);
              }
            }
          } else {
            path = window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickPath"];
          }
  
          // console.log(path);
          // console.log(highest_layer);
          if(!window.dontLog) console.log("pip: " + pointInPolygon(x, y, path));
          if(pointInPolygon(x, y, path)) {
            // create fill layer on top
            context.beginPath();
            context.moveTo(path[0][0], path[0][1])
            for(var c = 1; c < path.length; c++) {
                context.lineTo(path[c][0], path[c][1])
            }
            context.closePath();
            context.fillStyle = curColor;
            context.fill();
            addClick(undefined, undefined, undefined, false, name, curColor, undefined, undefined, path, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill);
            window.canvas_channel.push("message_new", {room: room, x: undefined, y: undefined, dragging: false, name: name, color: curColor, size: undefined, text: undefined, path: path, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill });
            
            break;
          }
  
      }
    }
  }
  
//   import consumer from "../channels/consumer";
  
  // Broadcast Types
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
  
  window.disconnectVideo = function() {
    window.currentUser = undefined;
    window.remoteVideoContainer = undefined;
    window.localstream = undefined;
    window.localVideo.srcObject = undefined;
    window.localVideo.muted = false;
  
    handleLeaveSession();
  }
  
  window.connectVideo = function(videoIncluded = true) {
    
    currentUser = $("#current-user")[0].innerHTML;
    window.currentUser = currentUser;
    localVideo = $("#local-video")[0];
    window.localVideo = localVideo;
    remoteVideoContainer = $("#remote-video-container")[0];
    window.remoteVideoContainer = remoteVideoContainer;
  
    if(!navigator.mediaDevices) return;
    navigator.mediaDevices
    .getUserMedia({
      audio: true,
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
    });
  
    $("#local-video").click(function(e) {
      if(!window.dontLog) console.log("video clicked")
      if($("#local-video").css("height") != "1024px") {
        $("#local-video").css("height", "1024px");
        $("#local-video").css("width", "1024px");
      } else {
        $("#local-video").css("height", "100%");
        $("#local-video").css("width", "100%");
      }
    })
  
    $("#input").change(function() {
      var type = $("#input").val();
      if(type == "cam") {
        navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then(function(stream) {
          window.localstream = stream;
          window.localVideo.srcObject = stream;
          window.localVideo.muted = true;
          for (const peerConnection in pcPeers) {
            if (Object.hasOwnProperty.call(pcPeers, peerConnection)) {
              const pc = pcPeers[peerConnection];
              stream.getVideoTracks().forEach(function(track) {
                var sender = pc.getSenders().find(function(s) {
                  return s.track.kind == track.kind;
                });
                sender.replaceTrack(track);
              });
            }
          }
        })
      } else if(type == "screen") {
        navigator.mediaDevices
        .getDisplayMedia({
          audio: true,
          video: true,
        })
        .then(function(stream){
          window.localstream = stream;
          window.localVideo.srcObject = stream;
          window.localVideo.muted = true;
          for (const peerConnection in pcPeers) {
            if (Object.hasOwnProperty.call(pcPeers, peerConnection)) {
              const pc = pcPeers[peerConnection];
              stream.getVideoTracks().forEach(function(track) {
                var sender = pc.getSenders().find(function(s) {
                  return s.track.kind == track.kind;
                });
                sender.replaceTrack(track);
              });
            }
          }
        })
      }
    })
  }
  
  const handleJoinSession = async () => {
    if(!window.dontLog) console.log("joining session")
    if(window.camera_session == null || window.camera_session == undefined) {
      window.camera_socket = new Amber.Socket('/session')
      camera_socket.connect()
        .then(() => {
            console.log("connected to /session")
            window.camera_session = camera_socket.channel('session:' + window.room)
            window.camera_session.join()
            
            window.camera_session.on('message_new', (data) => {
              if(!window.dontLog) console.log("received", data);
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
              console.log(data);
              broadcastData({
                type: JOIN_ROOM,
                from: currentUser,
                name: window.name,
                polite: window.polite,
              });
            })
        })

    } else {
      broadcastData({
            type: JOIN_ROOM,
            from: currentUser,
            name: window.name
          });
    }
  };
  
  const handleLeaveSession = () => {
    for (let user in pcPeers) {
      pcPeers[user].close();
    }
    pcPeers = {};
    userIds = {};
  
    remoteVideoContainer.innerHTML = "";
    
  
    // broadcastData({
    //   type: REMOVE_USER,
    //   name: window.name,
    //   from: currentUser,
    // });
  };
  
  const joinRoom = (data) => {
    // polite checker
    // if all true, make self impolite
    // if all false, make self polite
    polite_arr.push(data.polite);
    var checker = polite_arr => polite_arr.every(v => v === "true")
    if(checker == true) {
      polite = false;
    } else {
      checker = polite_arr => polite_arr.every(v => v === "false")
      if(checker == true) {
        polite = true;
      }
    }
    createPC(data.from, true, data.name);
  };
  
  const removeUser = (data) => {
    // if(data.name == window.name) {
    //   handleLeaveSession();
    //   handleJoinSession();
    //   return;
    // }
    if(!window.dontLog) console.log("removing user", data.from);
    let video = document.getElementById("remoteVideoContainer-" + data.from);
    video && video.remove();
    delete pcPeers[data.from];
    delete userIds[data.name];
  };
  
  const createPC = (userId, isOffer, n) => {
    if(!window.dontLog) console.log("createPC " + userId + " isOffer: " + isOffer + " name: " + n)
    
    let pc = new RTCPeerConnection(ice);
    const element = document.createElement("video");
    $(element).click(function() {
      if(!window.dontLog) console.log("video clicked")
      if($(this).css("height") != "1024px") {
        $(this).css("height", "1024px");
        $(this).css("width", "1024px");
      } else {
        $(this).css("height", "100%");
        $(this).css("width", "100%");
      }
      
    })
    element.id = `video-${userId}`
    element.autoplay = "autoplay";
    element.playsInline = true;
    $(element).css("height","100%");
    $(element).css("width","100%");
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
    $(video_mute).click(function(e){
      var el = e.currentTarget;
      toggleCamera($("#video-" + $(el).prop("user_id"))[0].srcObject, video_mute);
    })
    const audio_mute = document.createElement("button");
    audio_mute.id = `audio-mute-${userId}`
    $(audio_mute).prop("user_id", userId);
    $(audio_mute).html("Mute")
    $(audio_mute).addClass("btn btn-secondary btn-sm d-inline mr-1 mb-1");
    $(audio_mute).click(function(e){
      var el = e.currentTarget;
      toggleMic($("#video-" + $(el).prop("user_id"))[0].srcObject, audio_mute);
    })
    container.append(video_mute);
    container.append(audio_mute);
    container.id = `remoteVideoContainer-${userId}`;
    container.style = "float: left; display: inline; width: 25%; height: 25%; padding-left: 10px;"
    remoteVideoContainer.appendChild(container);
    $(container).addClass(`camUser-${n}`);
    // $(container).hide();
    $(`#video-${userId}`).on("play", function(e){
      $(`#remoteVideoContainer-${userId}`).show();
    })
  
    // console.log(`adding ${userId} to pcPeers`)
    pcPeers[userId] = pc;
    userIds[n] = userId;
  
    if(window.localstream){
      for (const track of window.localstream.getTracks()) {
        pc.addTrack(track, window.localstream);
      }
    }
  
    if(isOffer){
      window.makingOffer = true;
      pc
        .createOffer()
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
          if(pc.restartIce != undefined) pc.restartIce();
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
      // $(`.camUser-${name}`).show();
    };
  
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState == "disconnected") {
        if(!window.dontLog) console.log("Disconnected:", userId);
        $(`#remoteVideoContainer-${userId}`).remove();
        if(pc.restartIce != undefined) pc.restartIce();
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
        console.log("connection failed")
        if(pc.restartIce != undefined) pc.restartIce();
        // ghost remover

      } else if (pc.iceConnectionState == "connected") {
        // $(`#remoteVideoContainer-${userId}`).show();
      }
    };

    pc.onsignalingstatechange = (e) => {  // Workaround for Chrome: skip nested negotiations
      isNegotiating[pc] = (pc.signalingState != "stable");
    }
  
    pc.onnegotiationneeded = function () {
      if (isNegotiating[pc]) {
        console.log("SKIP nested negotiations");
        return;
      }
      isNegotiating[pc] = true;
      if(!window.dontLog) console.log('negotiationstarted');
      window.makingOffer = true;
      pc.createOffer().then(function (offer) {
          offer.sdp = setMediaBitrate(offer.sdp);
          return pc.setLocalDescription(offer);
      }).then(function () {
        if(!window.dontLog) console.log('negotiation signal sent');
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
        if(pc.restartIce != undefined) pc.restartIce();
      });
  }
  
    return pc;
  };
  
  const exchange = (data) => {
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
          logError(e)
          if(pc.restartIce != undefined) pc.restartIce();
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
                logError(e)
                if(pc.restartIce != undefined) pc.restartIce();
              });
          }
        }).catch(e => {
          logError(e)
          if(pc.restartIce != undefined) pc.restartIce();
        });
    }
  };
  
  const broadcastData = (data) => {
    if(!window.dontLog) console.log("broadcast data")
    /**
     * Add CSRF protection: https://stackoverflow.com/questions/8503447/rails-how-to-add-csrf-protection-to-forms-created-in-javascript
     */
    const csrfToken = document.querySelector("[name=_csrf]").content;
    const headers = new Headers({
      "content-type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
    });
  
    var urlParams = new URLSearchParams(window.location.search);
    var room = urlParams.get('room');
  
    data["room"] = room;
    
  
    fetch("sessions", {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    });
  };
  
  const logError = (error) => {
    if (!ignoreOffer) {
      console.log(error.message);
    }
    
  };
  
  
  var Pressure = require('pressure');
  window.Pressure = Pressure;
  
  // imports
  import $ from 'jquery';
  import { faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
  window.jQuery = $;
  window.$ = $;
  
  const dontLog = false;
  window.dontLog = dontLog;
  
  // variables
  var curColor = "#000000";
  var curSize = "1";
  var curLineJoin = "round";
  var curShapeType = "none";
  var curShapeWidth = "200";
  var curShapeHeight = "200";
  var curShapeFill = false;
  var curShapeAngle = "160";
  var oldSize;
  window.oldSize = oldSize;
  window.mpClickHash = {};
  window.mpNameHash = {};
  window.mpLayerOrder = [];
  window.backupMpClickHash = {};
  window.backupMpNameHash = {};
  window.backupMpLayerOrder = [];
  var paint;
  var context;
  var canvas;
  // var bgCanvas;
  var colorsUsed = [];
  window.colorsUsed = colorsUsed;
  
  window.canvas = canvas;
  var scale = 1;
  window.scale = scale;
  window.disabled = true;
  window.locked = false;
  
  window.last_ping = {};
  window.polite_arr = [];
  window.nicks = [];
  
  var camos = ["#604439", "#9e9a75", "#1c222e", "#41533b", "#554840"];
  var bluesky = ["#ffffff", "#a3b7ff", "#5189ff", "#2458c5", "#09175c"];
  var summerwave = ["#03385a", "#1b6a82", "#51d7d8", "#a95d23", "#351b07"];
  var relaxing = ["#ff0039", "#d00f64", "#a21f90", "#742ebc", "#463ee8"];
  var sunrise = ["#ffffff", "#ffc501", "#ff9700", "#fe0000", "#2b3a41"];
  var pink_sunrise = ["#23049d", "#aa2ee6", "#ff79cd", "#ffdf6b"];
  var beige_sky = ["#f0ebcc", "#3d84b8", "#344fa1", "#3f3697"];
  var oldschool_pixel = ["#caf7e3", "#edffec", "#f6dfeb", "#e4bad4"];
  var orange_sunrise = ["#72147e", "#f21170", "#fa9905", "#ff5200"];
  var gray_horizon = ["#393e46", "#00adb5", "#aad8d3", "#eeeeee"];
  var purple_sunset = ["#ffc996", "#ff8474", "#9f5f80", "#583d72"];
  var early_morning = ["#fcecdd", "#ffc288", "#fea82f", "#ff6701"];
  var crimson_night = ["#eeebdd", "#ce1212", "#810000", "#1b1717"];
  var twilight_forest = ["#98ddca", "#d5ecc2", "#ffd3b4", "#ffaaa7"];
  var forest_moon = ["#feffde", "#ddffbc", "#91c788", "#52734d"];
  var burnt_sun = ["#864000", "#d44000", "#ff7a00", "#ffefcf"];
  var before_night = ["#2b2e4a", "#e84545", "#903749", "#53354a"];
  
  
  var mouseBrushPt = [];
  var should_draw_brush = true;
  
  var curText = "";
  
  var last_key_was_tab = false
  var first_tab = false
  var tab_query = ""
  var tab_completion_index = 0
  var match_index = 0
  
  var name = localStorage.getItem("name");
  while(name == undefined || name == "" || name.length > 30 || !name.match(/^[a-z0-9]+$/i)) {
    name = prompt("What is your name? (alphanumeric, less than 30 characters, no spaces, no cursewords)");
  }
  localStorage.setItem("name", name);
  window.name = name;
  
  // when this gets too big, vote to clear canvas
  var getTotalSizeOfCanvas = function() {
    var size = 0;
    for(var j=0; j < Object.keys(window.mpClickHash).length; j++) {
      var key = Object.keys(window.mpClickHash)[j];
      var hash = window.mpClickHash[key];
      var mpClickX = hash["clickX"];
      size = size + mpClickX.length;
    }
    return size;
  }
  window.getTotalSizeOfCanvas = getTotalSizeOfCanvas;
  
  var mouseDown = function(mousedown_name, color, size) {
    if(mousedown_name.match(/^[a-z0-9]+$/i)) {
      $("#status").text(mousedown_name + " is drawing");
      $(".online-" + mousedown_name).html('<li class="online-'+ mousedown_name +'" style="color:' + color + ';">' + mousedown_name + '</div>')
    }
  }
  window.mouseDown = mouseDown;
  
  // add a click, either to local variables or to multiplayer hash
  var addClick = function(x, y, dragging, mp, click_name, color, size, text, path, line_join, shape_type, shape_width, shape_height, shape_fill, shape_angle)
  {
    if(x == undefined && 
      y == undefined &&
      dragging == undefined &&
      mp == undefined &&
      click_name == undefined &&
      color == undefined &&
      text == undefined && 
      path == undefined) return;
    if(size > 35 || size < 1)
      size = 35;
    if(shape_width > 360 || shape_width < 1) {
      shape_width = 360;
    }
    if(shape_height > 360 || shape_height < 1) {
      shape_height = 360;
    }
    if(shape_angle > 360 || shape_angle < 1) {
      shape_angle = 360;
    }
    if(!mp) {
      var layerName;
      var layer;
      if(window.mpNameHash[click_name] == undefined) {
        if(!dontLog) console.log("Click hash undefined, redefining...");
        layer = 0;
        window.mpNameHash[click_name] = layer;
        layerName = click_name + "_" + layer;
        window.mpClickHash[layerName] = {clickX: new Array(), clickY: new Array(), clickDrag: new Array(), clickColor: new Array(), clickSize: new Array(), clickText: new Array(), clickPath: new Array(), clickLineJoin: new Array(), clickShapeType: new Array(), clickShapeWidth: new Array(), clickShapeHeight: new Array(), clickShapeFill: new Array(), clickShapeAngle: new Array()};
      } else {
        if(dragging == false) {
          layer = window.mpNameHash[click_name] + 1;
          window.mpNameHash[click_name] = layer;
          layerName = click_name + "_" + layer;
          window.mpClickHash[layerName] = {clickX: new Array(), clickY: new Array(), clickDrag: new Array(), clickColor: new Array(), clickSize: new Array(), clickText: new Array(), clickPath: new Array(), clickLineJoin: new Array(), clickShapeType: new Array(), clickShapeWidth: new Array(), clickShapeHeight: new Array(), clickShapeFill: new Array(), clickShapeAngle: new Array()};
        } else {
          layer = window.mpNameHash[click_name];
          window.mpNameHash[click_name] = layer;
          layerName = click_name + "_" + layer;
        }
      }
      if(window.backupMpNameHash[click_name] == undefined) {
        window.backupMpNameHash[click_name] = 0;
      } else {
        if(dragging == false) {
          var layer = window.backupMpNameHash[click_name] + 1;
          window.backupMpNameHash[click_name] = layer;
        }
      }
      
      window.mpClickHash[layerName]["clickX"].push(x);
      window.mpClickHash[layerName]["clickY"].push(y);
      window.mpClickHash[layerName]["clickDrag"].push(dragging);
      window.mpClickHash[layerName]["clickColor"].push(color);
      window.mpClickHash[layerName]["clickSize"].push(size);
      window.mpClickHash[layerName]["clickText"].push(text);
      window.mpClickHash[layerName]["clickPath"].push(path);
      window.mpClickHash[layerName]["clickLineJoin"].push(line_join);
      window.mpClickHash[layerName]["clickShapeType"].push(shape_type);
      window.mpClickHash[layerName]["clickShapeWidth"].push(shape_width);
      window.mpClickHash[layerName]["clickShapeHeight"].push(shape_height);
      window.mpClickHash[layerName]["clickShapeFill"].push(shape_fill);
      window.mpClickHash[layerName]["clickShapeAngle"].push(shape_angle);
      window.backupMpClickHash[click_name + "_" + window.backupMpNameHash[click_name]] = window.mpClickHash[layerName];
      if(!window.mpLayerOrder.includes(layerName)) {
        window.mpLayerOrder.push(layerName);
      }
      if(!window.backupMpLayerOrder.includes(click_name + "_" + window.backupMpNameHash[click_name])) {
        window.backupMpLayerOrder.push(click_name + "_" + window.backupMpNameHash[click_name]);
      }
      //$("#status").html("you are drawing (" + layer + " layers)");
    } else {
      var layerName;
      if(window.mpNameHash[click_name] == undefined) {
        if(!dontLog) console.log("Click hash undefined, redefining...");
        var layer = 0;
        window.mpNameHash[click_name] = layer;
        layerName = click_name + "_" + layer;
        window.mpClickHash[layerName] = {clickX: new Array(), clickY: new Array(), clickDrag: new Array(), clickColor: new Array(), clickSize: new Array(), clickText: new Array(), clickPath: new Array(), clickLineJoin: new Array(), clickShapeType: new Array(), clickShapeWidth: new Array(), clickShapeHeight: new Array(), clickShapeFill: new Array(), clickShapeAngle: new Array()};
      } else {
        if(dragging == false) {
          var layer = window.mpNameHash[click_name] + 1;
          window.mpNameHash[click_name] = layer;
          layerName = click_name + "_" + layer;
          window.mpClickHash[layerName] = {clickX: new Array(), clickY: new Array(), clickDrag: new Array(), clickColor: new Array(), clickSize: new Array(), clickText: new Array(), clickPath: new Array(), clickLineJoin: new Array(), clickShapeType: new Array(), clickShapeWidth: new Array(), clickShapeHeight: new Array(), clickShapeFill: new Array(), clickShapeAngle: new Array()};
        } else {
          var layer = window.mpNameHash[click_name];
          window.mpNameHash[click_name] = layer;
          layerName = click_name + "_" + layer;
        }
      }
      if(window.backupMpNameHash[click_name] == undefined) {
        window.backupMpNameHash[click_name] = 0;
      } else {
        if(dragging == false) {
          var layer = window.backupMpNameHash[click_name] + 1;
          window.backupMpNameHash[click_name] = layer;
        }
      }
      
      window.mpClickHash[layerName]["clickX"].push(x);
      window.mpClickHash[layerName]["clickY"].push(y);
      window.mpClickHash[layerName]["clickDrag"].push(dragging);
      window.mpClickHash[layerName]["clickColor"].push(color);
      window.mpClickHash[layerName]["clickSize"].push(size);
      window.mpClickHash[layerName]["clickText"].push(text);
      window.mpClickHash[layerName]["clickPath"].push(path);
      window.mpClickHash[layerName]["clickLineJoin"].push(line_join);
      window.mpClickHash[layerName]["clickShapeType"].push(shape_type);
      window.mpClickHash[layerName]["clickShapeWidth"].push(shape_width);
      window.mpClickHash[layerName]["clickShapeHeight"].push(shape_height);
      window.mpClickHash[layerName]["clickShapeFill"].push(shape_fill);
      window.mpClickHash[layerName]["clickShapeAngle"].push(shape_angle);
      window.backupMpClickHash[click_name + "_" + window.backupMpNameHash[click_name]] = window.mpClickHash[layerName];
      if(!window.mpLayerOrder.includes(layerName)) {
        window.mpLayerOrder.push(layerName);
      }
      if(!window.backupMpLayerOrder.includes(click_name + "_" + window.backupMpNameHash[click_name])) {
        window.backupMpLayerOrder.push(click_name + "_" + window.backupMpNameHash[click_name]);
      }
    }
  }
  window.addClick = addClick;
  
  
  // bg: am i drawing the bg layer?
  // original: should i draw myself to a canvas that is saved as an original? (disabled)
  var redraw = function(bg, flatten){
    if(context == undefined) {
      return;
    } 
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0,  0.60 * screen.width,  0.60 * screen.height);
  
    // context.lineJoin = "round";
  
    context.imageSmoothingEnabled = true;
  
    if(bg) {
      // if(!dontLog) console.log("Drawing background canvas layer");
      // draw bgCanvas on canvas
      var destCtx = canvas.getContext('2d');
      destCtx.drawImage(window.bgCanvas, 0, 0);
    }
  
    // draw each user's canvas
    for(var j=0; j < window.mpLayerOrder.length; j++) {
      var layer = window.mpLayerOrder[j];
      // if(!dontLog) console.log("Drawing " + layer);
  
      var hash = window.mpClickHash[layer];
      var mpClickX = hash["clickX"];
      var mpClickY = hash["clickY"];
      var mpClickDrag = hash["clickDrag"];
      var mpClickColor = hash["clickColor"];
      var mpClickSize = hash["clickSize"];
      var mpClickText = hash["clickText"];
      var mpClickPath = hash["clickPath"];
      var mpLineJoin = hash["clickLineJoin"];
      var mpShapeType = hash["clickShapeType"];
      var mpShapeWidth = hash["clickShapeWidth"];
      var mpShapeHeight = hash["clickShapeHeight"];
      var mpShapeFill = hash["clickShapeFill"];
      var mpShapeAngle = hash["clickShapeAngle"];
      for(var i=0; i < mpClickX.length; i++) {
          if(mpShapeType[i] == "rect" || mpShapeType[i] == "circle" || mpShapeType[i] == "triangle") {
            switch(mpShapeType[i]) {
              case "rect":
                context.strokeStyle = mpClickColor[i];
                context.lineWidth = mpClickSize[i];
                context.beginPath();
                context.rect(mpClickX[i], mpClickY[i], mpShapeWidth[i], mpShapeHeight[i]);
                context.closePath();
                context.stroke();
                if(mpShapeFill[i]) {
                  context.fillStyle = mpClickColor[i];
                  context.fill();
                }
                break;
              case "circle":
                context.strokeStyle = mpClickColor[i];
                context.lineWidth = mpClickSize[i];
                context.beginPath();
                context.arc(mpClickX[i], mpClickY[i], mpShapeWidth[i], 0, 2 * Math.PI);
                context.closePath();
                context.stroke();
                if(mpShapeFill[i]) {
                  context.fillStyle = mpClickColor[i];
                  context.fill();
                }
                break;
              case "triangle":
                context.strokeStyle = mpClickColor[i];
                context.lineWidth = mpClickSize[i];
                var R1=parseInt(mpShapeWidth[i]), R2=parseInt(mpShapeHeight[i]), R3=parseInt(mpShapeAngle[i]);
                var Ax=0, Ay=0;
                var Bx=R3, By=0;
                var Cx=(R2*R1+R3*R3-R1*R1)/(2*R3);
                var Cy=Math.sqrt(R2*R2-Cx*Cx);
          
                var Ox = mpClickX[i] - Bx/2;
                var Oy = mpClickY[i] + Cy/2;
          
                context.beginPath();
                context.moveTo(Ox+Ax, Oy-Ay);
                context.lineTo(Ox+Bx, Oy-By);
                context.lineTo(Ox+Cx, Oy-Cy);
                context.closePath();
                context.stroke();
                if(mpShapeFill[i]) {
                  context.fillStyle = mpClickColor[i];
                  context.fill();
                }
                break;
            }
          } else {
            if(mpClickPath[i]) {
              const path = mpClickPath[i];
              context.beginPath();
              context.moveTo(path[0][0], path[0][1])
              for(var c = 1; c < path.length; c++) {
                  context.lineTo(path[c][0], path[c][1])
              }
              context.closePath();
              context.fillStyle = mpClickColor[i];
              context.fill();
            } else {
              if(mpClickText[i]) {
                context.fillStyle = mpClickColor[i];
                context.font = (mpClickSize[i] * 2).toString() + "px Arial";
                context.fillText(mpClickText[i], mpClickX[i], mpClickY[i]);
              } else {
                context.lineJoin = mpLineJoin[i];
                context.beginPath();
                if(mpClickDrag[i] && i) {
                  context.moveTo(mpClickX[i-1], mpClickY[i-1]);
                } else {
                  context.moveTo(mpClickX[i]-1, mpClickY[i]);
                }
                context.lineTo(mpClickX[i], mpClickY[i]);
                context.closePath();
                context.strokeStyle = mpClickColor[i];
                context.lineWidth = mpClickSize[i];
                context.stroke();
              }
            }
          }
  
      }
    }
  
    if(flatten) {
      should_draw_brush = false;
      if(!dontLog) console.log("Transferring drawing to background canvas")
      // copy canvas to bgCanvas
      var destCtx = window.bgCanvas.getContext('2d');
      destCtx.scale(scale, scale);
      destCtx.drawImage(canvas, 0, 0);
  
      // clear layer variables
      window.mpLayerOrder = [];
      window.mpClickHash = {};
      window.mpNameHash = {};
      should_draw_brush = true;
    }
  
    drawMousePoint();
  }
  window.redraw = redraw;
  
  window.rgbToHex = function(r, g, b){
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
    }
  
  var tap = function(e) {
    if(disabled) return;
    if(!e.touches) {
      var mouseX = e.pageX - this.offsetLeft;
      var mouseY = e.pageY - this.offsetTop;
    } else {
      if(e.touches.length < 2) {
        var touch = event.touches[0];
        var mouseX = (touch.pageX - this.offsetLeft);
        var mouseY = (touch.pageY - this.offsetTop);
      } else {
        return true;
      }
  
    }

    mouseX = scaledPositionX(mouseX);
    mouseY = scaledPositionY(mouseY);
  
    if($("#eyedropper").is(":checked")) {
      var canvasElement = $("#canvas")[0];
      var p = canvasElement.getContext('2d').getImageData(mouseX, mouseY, 1, 1).data;
      var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
      if(!dontLog) console.log("hex: " + hex);
      $("#color").val(hex);
      $("#color").change();
      $("#eyedropper").prop("checked", false);
      e.preventDefault();
      return false;
    }
  
    if($("#paintbucket").is(":checked")) {
      // var imageData = window.context.getImageData(0, 0, 1180, 690);
      floodFill(context, mouseX, mouseY, curColor);
      return false;
    }
  
    paint = true;
    if($("#text-tool").is(":checked"))
      addClick(mouseX, mouseY, false, false, name, curColor, curSize, curText, undefined, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle);
    else
      addClick(mouseX, mouseY, false, false, name, curColor, curSize, undefined, undefined, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle);
    if(getTotalSizeOfCanvas() > 2000) {
      window.redraw(true, true);
      // window.redraw(false, false);
    } else {
      window.redraw(true, false);
    }
    if($("#text-tool").is(":checked"))
      window.canvas_channel.push("message_new", {room: room, x: mouseX, y: mouseY, dragging: false, name: name, color: curColor, size: curSize, text: curText, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle });
    else
      window.canvas_channel.push("message_new", {room: room, x: mouseX, y: mouseY, dragging: false, name: name, color: curColor, size: curSize, text: undefined, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle });
      e.preventDefault();
  }
  
  var tapDrag = function(e) {
    if(disabled) return;
    if(!e.touches) {
      var mouseX = e.pageX - this.offsetLeft;
      var mouseY = e.pageY - this.offsetTop;
    } else {
      if(e.touches.length < 2) {
        var touch = event.touches[0];
        var mouseX = (touch.pageX - this.offsetLeft);
        var mouseY = (touch.pageY - this.offsetTop);
      } else {
        return true;
      }
    }

    mouseX = scaledPositionX(mouseX);
    mouseY = scaledPositionY(mouseY);
  
    if($("#random-brush-size").is(":checked")) {
      curSize = Math.floor(Math.random() * 35 + 1)
      curShapeWidth = Math.floor(Math.random() * 360 + 1)
      curShapeHeight = Math.floor(Math.random() * 360 + 1)
      curShapeAngle = Math.floor(Math.random() * 360 + 1)
    }
  
    if($("#rainbow").is(':checked')) {
      if($("#themes").val() == "rain")
        curColor = "#" + Math.floor(Math.random()*16777215).toString(16);
      else if($("#themes").val() == "camo")
        curColor = camos[Math.floor(Math.random() * camos.length)];
      else if($("#themes").val() == "bluesky")
        curColor = bluesky[Math.floor(Math.random() * bluesky.length)];
      else if($("#themes").val() == "summerwave")
        curColor = summerwave[Math.floor(Math.random() * summerwave.length)];
      else if($("#themes").val() == "relaxing")
        curColor = relaxing[Math.floor(Math.random() * relaxing.length)];
      else if($("#themes").val() == "sunrise")
        curColor = sunrise[Math.floor(Math.random() * sunrise.length)];
      else if($("#themes").val() == "pinksunrise")
        curColor = pink_sunrise[Math.floor(Math.random() * pink_sunrise.length)];
      else if($("#themes").val() == "beigesky")
        curColor = beige_sky[Math.floor(Math.random() * beige_sky.length)];
      else if($("#themes").val() == "oldschoolpixel")
        curColor = oldschool_pixel[Math.floor(Math.random() * oldschool_pixel.length)];
      else if($("#themes").val() == "orangesunrise")
        curColor = orange_sunrise[Math.floor(Math.random() * orange_sunrise.length)];
      else if($("#themes").val() == "purplesunset")
        curColor = purple_sunset[Math.floor(Math.random() * purple_sunset.length)];
      else if($("#themes").val() == "grayhorizon")
        curColor = gray_horizon[Math.floor(Math.random() * gray_horizon.length)];
      else if($("#themes").val() == "earlymorning")
        curColor = early_morning[Math.floor(Math.random() * early_morning.length)];
      else if($("#themes").val() == "crimsonnight")
        curColor = crimson_night[Math.floor(Math.random() * crimson_night.length)];
      else if($("#themes").val() == "twilightforest")
        curColor = twilight_forest[Math.floor(Math.random() * twilight_forest.length)];
      else if($("#themes").val() == "forestmoon")
        curColor = forest_moon[Math.floor(Math.random() * forest_moon.length)];
      else if($("#themes").val() == "burntsun")
        curColor = burnt_sun[Math.floor(Math.random() * burnt_sun.length)];
      else if($("#themes").val() == "beforenight")
        curColor = before_night[Math.floor(Math.random() * before_night.length)];
    }
  
    if(paint){
      if($("#eyedropper").is(":checked")) {
        var canvasElement = $("#canvas")[0];
        var p = canvasElement.getContext('2d').getImageData(mouseX, mouseY, 1, 1).data;
        var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        if(!dontLog) console.log("hex: " + hex);
        $("#color").val(hex);
        $("#color").change();
        e.preventDefault();
        return false;
      }
  
  
      if($("#text-tool").is(":checked"))
        addClick(mouseX, mouseY, true, false, name, curColor, curSize, curText, undefined, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle);
      else 
        addClick(mouseX, mouseY, true, false, name, curColor, curSize, undefined, undefined, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle);
      if(getTotalSizeOfCanvas() > 2000) {
          window.redraw(true, true);
        // window.redraw(false, false);
      } else {
          window.redraw(true, false);
      }
      if($("#text-tool").is(":checked"))
        window.canvas_channel.push("message_new", {room: room, x: mouseX, y: mouseY, dragging: true, name: name, color: curColor, size: curSize, text: curText, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle });
      else
      window.canvas_channel.push("message_new", {room: room, x: mouseX, y: mouseY, dragging: true, name: name, color: curColor, size: curSize, text: undefined, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle });
    }
  
    mouseBrushPt[0] = mouseX;
    mouseBrushPt[1] = mouseY;
    window.redraw(true, false);
    e.preventDefault();
  }
  
  window.drawMousePoint = function() {
    if(should_draw_brush) {
      if($("#shape_type").val() == "rect") {
        context.strokeStyle = curColor;
        context.lineWidth = curSize;
        context.beginPath();
        context.rect(mouseBrushPt[0], mouseBrushPt[1], curShapeWidth,  curShapeHeight);
        context.closePath();
        context.stroke();
        if(curShapeFill) {
          context.fillStyle = curColor;
          context.fill();
        }
      } else if($("#shape_type").val() == "circle") {
        context.strokeStyle = curColor;
        context.lineWidth = curSize;
        context.beginPath();
        context.arc(mouseBrushPt[0], mouseBrushPt[1], curShapeWidth, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();
        if(curShapeFill) {
          context.fillStyle = curColor;
          context.fill();
        }
      } else if($("#shape_type").val() == "triangle") {
        context.strokeStyle = curColor;
        context.lineWidth = curSize;
        var R1=parseInt(curShapeWidth), R2=parseInt(curShapeHeight), R3=parseInt(curShapeAngle);
        var Ax=0, Ay=0;
        var Bx=R3, By=0;
        var Cx=(R2*R1+R3*R3-R1*R1)/(2*R3);
        var Cy=Math.sqrt(R2*R2-Cx*Cx);
  
        var Ox = mouseBrushPt[0] - Bx/2;
        var Oy = mouseBrushPt[1] + Cy/2;
  
        context.beginPath();
        context.moveTo(Ox+Ax, Oy-Ay);
        context.lineTo(Ox+Bx, Oy-By);
        context.lineTo(Ox+Cx, Oy-Cy);
        context.closePath();
        context.stroke();
        if(curShapeFill) {
          context.fillStyle = curColor;
          context.fill();
        }
  
      } else if($("#shape_type").val() == "none")  {
        if(!$("#text-tool").is(":checked")){
          context.beginPath();
          context.moveTo(mouseBrushPt[0] - 1, mouseBrushPt[1]);
          context.lineTo(mouseBrushPt[0], mouseBrushPt[1]);
          context.closePath();
          context.strokeStyle = curColor;
          context.lineWidth = curSize;
          context.lineJoin = curLineJoin;
          context.stroke();
        } else {
          context.fillStyle = curColor;
          context.font = (curSize * 2).toString() + "px Arial";
          context.fillText(curText, mouseBrushPt[0], mouseBrushPt[1]);
        }
      }
    }
  }
  
  window.notifyMe = function(message) {
    if (!window.Notification) {
      if(!dontLog) console.log('Browser does not support notifications.');
    } else {
        // check if permission is already granted
        if (Notification.permission === 'granted') {
            // show notification here
            var notify = new Notification("Gbaldraw", {
                body: message
            });
        } else {
            // request permission from user
            Notification.requestPermission().then(function (p) {
                if (p === 'granted') {
                    // show notification here
                    var notify = new Notification('Hi there!', {
                        body: 'How are you doing?',
                        icon: 'https://bit.ly/2DYqRrh',
                    });
                } else {
                  if(!dontLog) console.log('User blocked notifications.');
                }
            }).catch(function (err) {
                console.error(err);
            });
        }
    }
  }
  
  window.sformat = function(s) {
    var fm = [
          Math.floor(s / 60 / 60 / 24), // DAYS
          Math.floor(s / 60 / 60) % 24, // HOURS
          Math.floor(s / 60) % 60, // MINUTES
          s % 60 // SECONDS
    ];
    return $.map(fm, function(v, i) { return ((v < 10) ? '0' : '') + v; }).join(':');
  }
  
  function base64ToBlob(base64, mime) 
  {
      mime = mime || '';
      var sliceSize = 1024;
      var byteChars = window.atob(base64);
      var byteArrays = [];
  
      for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
          var slice = byteChars.slice(offset, offset + sliceSize);
  
          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }
  
          var byteArray = new Uint8Array(byteNumbers);
  
          byteArrays.push(byteArray);
      }
  
      return new Blob(byteArrays, {type: mime});
  }
  
  window.scroll_to_bottom = function() {
    var log = $('#chat_area')[0];
    if(log.scrollTop != log.scrollHeight) {
      // log.animate({ scrollTop: log.prop('scrollHeight')}, 100);
      log.scrollTop = log.scrollHeight;
      // setTimeout(window.scroll_to_bottom, 100);
    }
  }
  
  $(function() {
  
    // reset the color picker (FF fix)
    $("#color").val("#000000");
    $("#eyedropper").prop("checked", false);
    $("#rainbow").prop("checked", false);
    $("#eraser").prop("checked", false);
    $("#text-tool").prop("checked", false);
    $("#paintbucket").prop("checked", false);
    $("#shape_fill").prop("checked", false);
    $("#random-brush-size").prop("checked", false);
    
    oldSize = $("#brush-size").val();
  
    var canvasDiv = document.getElementById('canvasDiv');
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', 0.60 * screen.width);
    canvas.setAttribute('height', 0.60 * screen.height);
    canvas.setAttribute('id', 'canvas');
    window.canvas = canvas;
  
    var bgCanvasDiv = document.getElementById('bgCanvasDiv');
    window.bgCanvas = document.createElement('canvas');
    window.bgCanvas.setAttribute('width', 0.60 * screen.width);
    window.bgCanvas.setAttribute('height', 0.60 * screen.height);
    window.bgCanvas.setAttribute('id', 'bgCanvas');
  
    $("#downloader").click(function() {
      document.getElementById("downloader").download = "image.png";
      document.getElementById("downloader").href = canvas.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    })
  
    $("#uploader").click(function(e) {
      var dataURL = canvas.toDataURL();
      if(!window.dontLog) console.log(dataURL);
      var url = "/upload_to_imgur";
      var base64ImageContent = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");           
      var blob = base64ToBlob(base64ImageContent, 'image/png');                
      var formData = new FormData();
      formData.append('picture', blob);

      const csrfToken = document.querySelector("[name=_csrf]").content;
      const headers = {
        "X-CSRF-TOKEN": csrfToken,
      }
  
      $.ajax({
          url: url,
          headers: headers, 
          type: "POST", 
          cache: false,
          contentType: false,
          processData: false,
          data: formData})
              .done(function(e){
                var link = JSON.parse(e)["data"]["link"];
                window.open(link);
              });
  
      e.preventDefault();
    })
  
    $("#clear_canvas").click(function(e) {
      $.get("/clear_canvas?room=" + room, function() {
  
      });
      e.preventDefault();
    })
  
    canvas.addEventListener('touchstart', tap);
    canvas.addEventListener('touchmove', tapDrag);
    // canvasDiv.appendChild(bgCanvas);
    canvasDiv.appendChild(canvas);
    if(typeof G_vmlCanvasManager != 'undefined') {
      canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d");
    window.context = context;
  
    context.scale(scale, scale);
  
    $('#canvas').mousedown(tap);
  
    $('#canvas').mousemove(tapDrag);
  
    $('#canvas').mouseup(function(e){
      window.edits = window.edits + 1;
      paint = false;
      window.canvas_channel.push("message_new", { mouseUp: true, name: name, room: room });
    });
  
    $('#canvas').bind("touchend", function(e){
      paint = false;
      window.canvas_channel.push("message_new", { mouseUp: true, name: name, room: room });
    });
  
    $('#canvas').mouseleave(function(e){
      paint = false;
      window.canvas_channel.push("message_new", { mouseUp: true, name: name, room: room });
    });
  
    $(document).keydown(function(e){
      if(!dontLog) console.log(e.which);
    });
  
    function setEndOfContenteditable(contentEditableElement)
  {
      var range,selection;
      if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
      {
          range = document.createRange();//Create a range (a range is a like the selection but invisible)
          range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
          range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
          selection = window.getSelection();//get the selection object (allows you to change selection)
          selection.removeAllRanges();//remove any selections already made
          selection.addRange(range);//make the range you have just created the visible selection
      }
      else if(document.selection)//IE 8 and lower
      { 
          range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
          range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
          range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
          range.select();//Select the range (make it the visible selection
      }
  }
  
    $("#chat_message").keydown((e) => { 
      console.log(e.which);
      if(e.which == 9) {
        // tab completion code
  
        if (last_key_was_tab) {
          first_tab = false
        } else {
            first_tab = true
        }
  
        last_key_was_tab = true
  
        let message = $("#chat_message").html();
        console.log(message)
  
        if (first_tab) {
          tab_query = message.split(" ")[message.split(" ").length - 1]
        }
        console.log(tab_query);
        if (tab_query == "") { return; }
  
  
        var matches = []
        let regex = new RegExp(tab_query)
        console.log(regex);
  
        // uncoverted below
        for (var i = 0; i < nicks.length; i++) {
            var nick = nicks[i];
            let nsString = nick
            console.log(nick);
            // let results = regex.matches(in: nick,
            // range: NSRange(nick.startIndex..., in: nick))
            let results = nick.substr(0, nick.length - 1).match(regex)
            console.log(results)
  
            if(results == null) results = [];
            
            for (var x = 0; x < results.length; x++) {
                let matchString = nsString
                matches.push(matchString)
            }
        }
  
        match_index = match_index + 1
        if (matches.length > 0) {
            match_index = match_index % matches.length
            let match = matches[match_index]
        
            if (first_tab) {
                tab_completion_index = $("#chat_message").html().length
                tab_completion_index = tab_completion_index - tab_query.length
            }
            
            let msg = $("#chat_message").html();
  
            let start_index = tab_completion_index
            console.log(start_index)
            
            let left_matter = msg.substr(0, start_index)
  
            console.log(left_matter);
  
            $("#chat_message").html(left_matter + match);
  
            setEndOfContenteditable($("#chat_message")[0]);
        }
  
        e.preventDefault();
      } else {
        last_key_was_tab = false
      }
      var curTextColor;
      if($(window.rainbow).is(":checked")) {
        if($("#themes").val() == "rain")
          curTextColor = "#" + Math.floor(Math.random()*16777215).toString(16);
        else if($("#themes").val() == "camo")
          curTextColor = camos[Math.floor(Math.random() * camos.length)];
        else if($("#themes").val() == "bluesky")
          curTextColor = bluesky[Math.floor(Math.random() * bluesky.length)];
        else if($("#themes").val() == "summerwave")
          curTextColor = summerwave[Math.floor(Math.random() * summerwave.length)];
        else if($("#themes").val() == "relaxing")
          curTextColor = relaxing[Math.floor(Math.random() * relaxing.length)];
        else if($("#themes").val() == "sunrise")
          curTextColor = sunrise[Math.floor(Math.random() * sunrise.length)];
        else if($("#themes").val() == "pinksunrise")
          curTextColor = pink_sunrise[Math.floor(Math.random() * pink_sunrise.length)];
        else if($("#themes").val() == "beigesky")
          curTextColor = beige_sky[Math.floor(Math.random() * beige_sky.length)];
        else if($("#themes").val() == "oldschoolpixel")
          curTextColor = oldschool_pixel[Math.floor(Math.random() * oldschool_pixel.length)];
        else if($("#themes").val() == "orangesunrise")
          curTextColor = orange_sunrise[Math.floor(Math.random() * orange_sunrise.length)];
        else if($("#themes").val() == "purplesunset")
          curTextColor = purple_sunset[Math.floor(Math.random() * purple_sunset.length)];
        else if($("#themes").val() == "grayhorizon")
          curTextColor = gray_horizon[Math.floor(Math.random() * gray_horizon.length)];
        else if($("#themes").val() == "earlymorning")
          curTextColor = early_morning[Math.floor(Math.random() * early_morning.length)];
        else if($("#themes").val() == "crimsonnight")
          curTextColor = crimson_night[Math.floor(Math.random() * crimson_night.length)];
        else if($("#themes").val() == "twilightforest")
          curTextColor = twilight_forest[Math.floor(Math.random() * twilight_forest.length)];
        else if($("#themes").val() == "forestmoon")
          curTextColor = forest_moon[Math.floor(Math.random() * forest_moon.length)];
        else if($("#themes").val() == "burntsun")
          curTextColor = burnt_sun[Math.floor(Math.random() * burnt_sun.length)];
        else if($("#themes").val() == "beforenight")
          curTextColor = before_night[Math.floor(Math.random() * before_night.length)];
      
      
        document.execCommand("foreColor", false, curTextColor)
  
  
        // if($("#themes").val() == "rain")
        //   curTextColor = "#" + Math.floor(Math.random()*16777215).toString(16);
        // else if($("#themes").val() == "camo")
        //   curTextColor = camos[Math.floor(Math.random() * camos.length)];
        // else if($("#themes").val() == "bluesky")
        //   curTextColor = bluesky[Math.floor(Math.random() * bluesky.length)];
        // else if($("#themes").val() == "summerwave")
        //   curTextColor = summerwave[Math.floor(Math.random() * summerwave.length)];
        // else if($("#themes").val() == "relaxing")
        //   curTextColor = relaxing[Math.floor(Math.random() * relaxing.length)];
        // else if($("#themes").val() == "sunrise")
        //   curTextColor = sunrise[Math.floor(Math.random() * sunrise.length)];
        // else if($("#themes").val() == "pinksunrise")
        //   curTextColor = pink_sunrise[Math.floor(Math.random() * pink_sunrise.length)];
        // else if($("#themes").val() == "beigesky")
        //   curTextColor = beige_sky[Math.floor(Math.random() * beige_sky.length)];
        // else if($("#themes").val() == "oldschoolpixel")
        //   curTextColor = oldschool_pixel[Math.floor(Math.random() * oldschool_pixel.length)];
        // else if($("#themes").val() == "orangesunrise")
        //   curTextColor = orange_sunrise[Math.floor(Math.random() * orange_sunrise.length)];
        // else if($("#themes").val() == "purplesunset")
        //   curTextColor = purple_sunset[Math.floor(Math.random() * purple_sunset.length)];
        // else if($("#themes").val() == "grayhorizon")
        //   curTextColor = gray_horizon[Math.floor(Math.random() * gray_horizon.length)];
        // else if($("#themes").val() == "earlymorning")
        //   curTextColor = early_morning[Math.floor(Math.random() * early_morning.length)];
        // else if($("#themes").val() == "crimsonnight")
        //   curTextColor = crimson_night[Math.floor(Math.random() * crimson_night.length)];
        // else if($("#themes").val() == "twilightforest")
        //   curTextColor = twilight_forest[Math.floor(Math.random() * twilight_forest.length)];
        // else if($("#themes").val() == "forestmoon")
        //   curTextColor = forest_moon[Math.floor(Math.random() * forest_moon.length)];
        // else if($("#themes").val() == "burntsun")
        //   curTextColor = burnt_sun[Math.floor(Math.random() * burnt_sun.length)];
        // else if($("#themes").val() == "beforenight")
        //   curTextColor = before_night[Math.floor(Math.random() * before_night.length)];
        
        // document.execCommand("backColor", false, curTextColor)
  
        
      } 
    })
  
    $("#color").change(function(){
      curColor = $("#color").val();
      colorsUsed.push(curColor);
      var colors = colorsUsed.slice(Math.max(colorsUsed.length - 16, 0))
      colors.forEach((element, index) => {
        $("#last-color-" + index).css("background-color", element);
      });
    })
  
    $("#brush_type").change(function(){
      curLineJoin = $("#brush_type").val();
      window.curLineJoin = curLineJoin;
    })
  
    $("#brush_type").change();
  
    $("#shape_type").change(function(){
      curShapeType = $("#shape_type").val();
      if(curShapeType == "rect") {
        $("#a_param").show();
        $("#b_param").show();
        $("#c_param").hide();
        $("#a_label").html("w");
        $("#b_label").html("h");
        
      } else if(curShapeType == "circle") {
        $("#a_param").show();
        $("#b_param").hide();
        $("#c_param").hide();
        $("#a_label").html("r");
        
      } else if(curShapeType == "triangle") {
        $("#a_param").show();
        $("#b_param").show();
        $("#c_param").show();
        $("#a_label").html("a");
        $("#b_label").html("b");
        $("#c_label").html("c");
      }
      window.curShapeType = curShapeType;
    })
  
    $("#shape_type").change();
  
    $("#shape_width").keyup(function(){
      curShapeWidth = parseInt($("#shape_width").val());
      if(curShapeWidth > 360 || curShapeWidth < 1) {
        curShapeWidth = 360;
      }
      $("#shape_width").val(curShapeWidth);
      window.curShapeWidth = curShapeWidth;
    })
  
    $("#shape_height").keyup(function(){
      curShapeHeight = parseInt($("#shape_height").val());
      if(curShapeHeight > 360 || curShapeHeight < 1) {
        curShapeHeight = 360;
      }
      $("#shape_height").val(curShapeHeight);
      window.curShapeHeight = curShapeHeight;
    })
  
    $("#shape_angle").keyup(function(){
      curShapeAngle = parseInt($("#shape_angle").val());
      if(curShapeAngle > 360 || curShapeAngle < 1) {
        curShapeAngle = 360;
      }
      $("#shape_angle").val(curShapeAngle);
      window.curShapeAngle = curShapeAngle;
    })
  
    $("#shape_fill").change(function() {
      curShapeFill = $("#shape_fill").is(":checked");
      window.curShapeFill = curShapeFill;
    })
  
    $(".swatch").click(function(e) {
      var color = $(e.target).css("background-color");
      var hexDigits = new Array
          ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 
  
      //Function to convert rgb color to hex format
      function rgb2hex(rgb) {
      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
      }
  
      function hex(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
      }
      $("#color").val(rgb2hex(color));
      curColor = $("#color").val();
    })
  
    $("#brush-size").val(curSize);
  
    $("#brush-size").bind("input", function(){
      if(!dontLog) console.log("CurSize: " + curSize);
      curSize = $("#brush-size").val();
      if(curSize > 35 || curSize < 1)
        curSize = 35;
    })
  
    $("#dark-mode").click(function() {
      if(!$("#dark-mode").is(":checked")) {
        var bgDark = $("body");
        bgDark.removeClass("bg-dark")
        bgDark.addClass("bg-light")
      } else {
        var bgLight = $("body");
        bgLight.removeClass("bg-light")
        bgLight.addClass("bg-dark")
      }
    })
  
    // clear chat on first load
    // $("#chat_area").val("");
  
    // chat ability
    $("#send_message").click(function() {
      var chat_message = $("#chat_message").html();
      if(chat_message != "") {
        if(window.last_message != chat_message) {
          window.chat_channel.push("message_new", {name: name, chat_message: chat_message, room: room});
          $("#chat_message").html("");
          window.last_message = chat_message
        } else {
          $("#chat_message").html("");
        }
      }
    });
  
    $("#chat_message").keyup(function(e){
      if(e.keyCode == 13)
      {
          $("#send_message").trigger("click");
          e.preventDefault();
      }
    });
  
    $("#private_room").click(function() {
      var code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      window.open("/?room=" + code);
      return false;
    });
  
  
    var chat_area = $('#chat_area');
    chat_area.scrollTop(chat_area[0].scrollHeight - chat_area.height());
  
    // onload
    
  
    $("#name").val(name);
  
    $("#name").keyup(function(){
      if($("#name").val() != undefined && $("#name").val() != "" && $("#name").val().length < 30 && $("#name").val().match(/^[a-z0-9]+$/i)) {
        name = $("#name").val()
        window.name = name;
        localStorage.setItem("name", name);
      } else {
        $("#name").val(name);
      }
    });
  
    $("#eyedropper").change(function(){
      if($("#eyedropper").is(":checked")) {
      $("#rainbow").prop("checked", false);
      $("#eraser").prop("checked", false);
      $("#text-tool").prop("checked", false);
      should_draw_brush = false;
      } else {
        should_draw_brush = true;
      }
    })
  
    $("#rainbow").bind("change", function(){
      if($("#rainbow").is(":checked")) {
        $("#eyedropper").prop("checked", false);
        $("#eraser").prop("checked", false);
        window.oldColor = curColor;
      } else {
        curColor = window.oldColor;
      }
    });
  
    $("#text-tool").change(function(){
      $("#eyedropper").prop("checked", false);
      $("#eraser").prop("checked", false);
    })
  
    $("#text-to-write").keyup(function() {
      var badword = "avttre";
      var realbadword = badword.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
      if($("#text-to-write").val().toLowerCase().includes(realbadword)) {
        $("#text-to-write").val("Black Lives Matter");
      }
    })
  
    $("#eraser").bind("change", function(){
      if($("#eraser").is(":checked")) {
        $("#eyedropper").prop("checked", false);
        $("#rainbow").prop("checked", false);
        $("#text-tool").prop("checked", false);
        window.oldColor = curColor;
        window.oldSize = curSize;
        curColor = "#FFFFFF"
        $("#color").val(curColor);
        $("#brush-size").val(35);
        $("#brush-size").trigger("input");
      } else {
        curColor = window.oldColor;
        curSize = window.oldSize;
        $("#color").val(curColor);
        $("#brush-size").val(curSize);
        $("#brush-size").trigger("input");
      }
    });
  
    $("#text-to-write").keyup(function(){
      curText = $("#text-to-write").val();
      window.curText = curText;
    })
  
    Pressure.set('#canvas', {
      start: function(event){
        // this is called on force start
      },
      end: function(){
        // this is called on force end
      },
      startDeepPress: function(event){
        // this is called on "force click" / "deep press", aka once the force is greater than 0.5
      },
      endDeepPress: function(){
        // this is called when the "force click" / "deep press" end
      },
      change: function(force, event){
        // this is called every time there is a change in pressure
        // 'force' is a value ranging from 0 to 1
        $("#brush-size").val(force * 35);
        curSize = $("#brush-size").val();
      },
      unsupported: function(){
        // console.log("unsupported...");
        // NOTE: this is only called if the polyfill option is disabled!
        // this is called once there is a touch on the element and the device or browser does not support Force or 3D touch
      }
    }, {polyfill: false});
  
    var date = new Date();
    // is it october or november?
    if(date.getMonth() + 1 == 10) {
      // halloween mode
      let borders = ["pumpkin", "spiderweb", "tomb", "bat"];
      var border = borders[Math.floor(Math.random()*borders.length)];
      if(!dontLog) console.log("border: " + border);
      $("canvas").addClass(border);
    } else if (date.getMonth() + 1 == 11) {
      let borders = ["feather", "pilgrim_hat", "pumpkin", "pumpkin_pie"];
      var border = borders[Math.floor(Math.random()*borders.length)];
      if(!dontLog) console.log("border: " + border);
      $("canvas").addClass(border);
    }
  
    // timer
    setInterval(function() {
      if(window.original_ttl != -2) { // dont run the timer if there is none
        window.t = window.t - 1;
        var seconds = window.t;
        var time = sformat(seconds);
        $("#ttl").html(time + " left until canvas is cleared.");
        if(seconds <= 0) {
          window.locked = true;
          window.disabled = true;
          $("#ttl").html("canvas reset. refresh to unlock the canvas.")
        }
      }
    }, 1000)
  
    // welcome message
    // window.notifyMe("Welcome to Gbaldraw, " + name + "! All edits made will be seen live by all visitors of this site. Updates are persisted. Please consider buying an ad to support the development of this site.");
  
    // cam
    $("#input").val("cam");
  
    $("#cam-name").html(`you: ${window.name}`);
  
    if(context) {
      redraw();
    }
  
    $("#join-button").click(function() {
      $("#join-button").prop("disabled", true);
      $("#join-audio-button").prop("disabled", true);
      $("#leave-button").prop("disabled", false);
      window.connectVideo();
    })

    $("#join-audio-button").click(function() {
      $("#join-button").prop("disabled", true);
      $("#join-audio-button").prop("disabled", true);
      $("#leave-button").prop("disabled", false);
      window.connectVideo(false);
    })
  
    $("#leave-button").click(function() {
      $("#join-button").prop("disabled", false);
      $("#join-audio-button").prop("disabled", false);
      $("#leave-button").prop("disabled", true);
      window.disconnectVideo();
    })
  
    $("#mute-button").click(() => {
      toggleMic(window.localstream, "#mute-button");
    })
  
    $("#video-mute-button").click(() => {
      toggleCamera(window.localstream, "#video-mute-button");
    })
  
    $("#color_icon").click(() => {
      $("#color").click();
    })
    
    $("#rainbow_icon").click(() => {
      $("#rainbow").click();
    })
  
    $("#text_tool_icon").click(() => {
      $("#text-tool").click();
    })
    
    $("#eraser_icon").click(() => {
      $("#eraser").click();
    })
    
    $("#paintbucket_icon").click(() => {
      $("#paintbucket").click();
    })
  
    $("#eyedropper_icon").click(() => {
      $("#eyedropper").click();
    })
  
    $("#undo_icon").click(() => {
      $("#undo").click();
    })
  
    $("#call-volume").on("input", function() {
      $("video").each(function (e , i) { i.volume = $("#call-volume").val() })
    })
  
    $("#undo").click(() => {
      // if(window.edits <= 0) return;
      window.canvas_channel.push("message_new", {name: window.name, undo: true, room: room});
    })
  
    $("#text_color").change(function(){
      if(!$("#chat_message").is(":focus")) $("#chat_message").focus();
      document.execCommand("styleWithCSS", false, false);
      document.execCommand("foreColor", false, $("#text_color").val());
    })
  
    $("#text_back_color").change(function(){
      if(!$("#chat_message").is(":focus")) $("#chat_message").focus();
      document.execCommand("styleWithCSS", false, false);
      document.execCommand("backColor", false, $("#text_back_color").val());
    })
    
    document.querySelector(".actions").addEventListener("mousedown", function (e) {
      var action = e.target.dataset.action;
      if(!$("#chat_message").is(":focus")) $("#chat_message").focus();
      if(!window.dontLog) console.log(action);
      if (action && action != "createLink" && action != "insertImage" && action != "searchGiphy" && action != "insertHTML") {
        document.execCommand(action, false)
        //prevent button from actually getting focused
        e.preventDefault();
      } else if(action == "insertImage") {
        var sLnk=prompt('Enter a URL','http:\/\/');
        document.execCommand(action, false, sLnk);
      } else if(action == "createLink") {
        var sLnk=prompt('Enter a URL','http:\/\/');
        if(sLnk&&sLnk!=''&&sLnk!='http://'){
          document.execCommand('insertHTML', false, '<a href="' + sLnk + '" target="_blank">' + sLnk + '</a>');
        }
      } else if(action == "searchGiphy") {
        var q=prompt('Enter gif search terms','');
        gf.search(q).then((f) => { console.log(f['data'][0]['id']); document.execCommand("insertImage", false, "https://i.giphy.com/media/" + f['data'][0]['id'] + "/giphy.gif" ) })
      } else if (action == "insertHTML") {
        var html = prompt("Insert HTML");
        document.execCommand(action, false, html);
      }
    })
  
    const picker = new EmojiButton();
    const trigger = document.querySelector('#emoji-trigger');
  
    picker.on('emoji', selection => {
      // handle the selected emoji here
      // console.log(selection.emoji);
      $("#chat_message").html($("#chat_message").html() + selection.emoji);
    });
  
    trigger.addEventListener('click', () => picker.togglePicker(trigger));
    
    $("img").one("load", function() {
      window.scroll_to_bottom();
    });
  
    window.scroll_to_bottom();
  
    // require("livepixel/somafm")

    $("#full-screen").click(function() {
      $(window).bind("resize", function(){
        var w = $(screen).width() * 0.60;
        var h = $(screen).height() * 0.60;
    
        $("canvas").css("width", w + "px");
        $("canvas").css("height", h + "px"); 
      });
    
    //using HTML5 for fullscreen (only newest Chrome + FF)
    
    $("canvas")[0].requestFullscreen(); //Firefox
    
    
    
    
    })

    $(".dropdown-item").click((e) => {
      var type = $(e.currentTarget).html();
      console.log(type);
      $("#input").val(type);
      $("#input").change();
    })
  
  })
  
  $(document).on("unload", function() {
    handleLeaveSession();
    window.camera_socket.close();
    window.canvas_socket.close();
    window.persistence_socket.close()
    window.session_socket.close();
  })
  
  window.start_pinging = () => {
    if(window.canvas_channel) window.canvas_channel.push("message_new", {name: window.name, ping: true, room: room});
  }