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

var smallDevice = window.matchMedia("(max-width: 1280px)").matches;

window.isTabletOrPhone = smallDevice; ///(iphone|ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);


if (isTabletOrPhone) {
    try {
        screen.lockOrientation("orientation");

    } catch (e) {
        console.log("orientation lock error: " + e.message);
    }

}

window.palettes = {
    "mac": ["#000000", "#fbf305", "#ff6403", "#dd0907", "#f20884", "#4700a5", "#0000d3", "#02abea", "#1fb714", "#fbf305", "#562c05", "#90713a", "#C0C0C0", "#808080", "#404040", "#ffffff"],
    "windows": ["#000000", "#800000", "#008000", "#808000", "#000080", "#800080", "#008080", "#C0C0C0", "#c0dcc0", "#a6caf0", "#fffbf0", "#a0a0a4", "#808080", "#FF0000", "#0f0", "#ff0"]
}

import {updateStreamSource, handleJoinSession, handleLeaveSession} from "./modules/cam" 

window.room = window.location.toString().split("\/o\/")[1];



// renderGif not needed because of resolve
import { GiphyFetch } from '@giphy/js-fetch-api'

// create a GiphyFetch with your api key
// apply for a new Web SDK key. Use a separate key for every platform (Android, iOS, Web)
window.gf = new GiphyFetch('ZTlXzVf7OBMC3FDNZhYXZDk8mPPLerCA')

// const vanillaJSGif = async (mountNode: HTMLElement) => {
//     // render a single gif
//     const { data: gif1 } = await gf.gif('fpXxIjftmkk9y')
//     renderGif({ gif: gif1, width: 300 }, mountNode)
// }



window.edits = 0;



//   import consumer from "../channels/consumer";

// Broadcast Types

var Pressure = require('pressure');
window.Pressure = Pressure;

// imports
import $ from 'jquery';
import { faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
import { isThisTypeNode } from 'typescript';
window.jQuery = $;
window.$ = $;

const dontLog = false;
window.dontLog = dontLog;

// variables
window.curColor = "#000000";
window.curSize = "1";
window.curLineJoin = "round";
window.curShapeType = "none";
window.curShapeWidth = "200";
window.curShapeHeight = "200";
window.curShapeFill = false;
window.curShapeAngle = "160";
window.curBrushStyle = "none";
var oldSize;
window.oldSize = oldSize;
window.mpClickHash = {};
window.mpNameHash = {};
window.mpLayerOrder = [];
window.backupMpClickHash = {};
window.backupMpNameHash = {};
window.backupMpLayerOrder = [];
// window.curColor = curColor;
var paint;
window.paint = paint;
var context;
window.context = context;
var canvas;
window.canvas = canvas;
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

window.count = 0;
window.points = [];


window.camos = ["#604439", "#9e9a75", "#1c222e", "#41533b", "#554840"];
window.bluesky = ["#ffffff", "#a3b7ff", "#5189ff", "#2458c5", "#09175c"];
window.summerwave = ["#03385a", "#1b6a82", "#51d7d8", "#a95d23", "#351b07"];
window.relaxing = ["#ff0039", "#d00f64", "#a21f90", "#742ebc", "#463ee8"];
window.sunrise = ["#ffffff", "#ffc501", "#ff9700", "#fe0000", "#2b3a41"];
window.pink_sunrise = ["#23049d", "#aa2ee6", "#ff79cd", "#ffdf6b"];
window.beige_sky = ["#f0ebcc", "#3d84b8", "#344fa1", "#3f3697"];
window.oldschool_pixel = ["#caf7e3", "#edffec", "#f6dfeb", "#e4bad4"];
window.orange_sunrise = ["#72147e", "#f21170", "#fa9905", "#ff5200"];
window.gray_horizon = ["#393e46", "#00adb5", "#aad8d3", "#eeeeee"];
window.purple_sunset = ["#ffc996", "#ff8474", "#9f5f80", "#583d72"];
window.early_morning = ["#fcecdd", "#ffc288", "#fea82f", "#ff6701"];
window.crimson_night = ["#eeebdd", "#ce1212", "#810000", "#1b1717"];
window.twilight_forest = ["#98ddca", "#d5ecc2", "#ffd3b4", "#ffaaa7"];
window.forest_moon = ["#feffde", "#ddffbc", "#91c788", "#52734d"];
window.burnt_sun = ["#864000", "#d44000", "#ff7a00", "#ffefcf"];
window.before_night = ["#2b2e4a", "#e84545", "#903749", "#53354a"];


window.mouseBrushPt = [];
window.should_draw_brush = true;

window.curText = "";

window.last_key_was_tab = false
window.first_tab = false
window.tab_query = ""
window.tab_completion_index = 0
window.match_index = 0

var name = localStorage.getItem("name");
while (name == undefined || name == "" || name.length > 30 || !name.match(/^[a-z0-9]+$/i)) {
    name = prompt("What is your name? (alphanumeric, less than 30 characters, no spaces, no cursewords)");
}
localStorage.setItem("name", name);
window.name = name;

// when this gets too big, vote to clear canvas
import {getTotalSizeOfCanvas} from "./modules/get_total_size_of_canvas"
window.getTotalSizeOfCanvas = getTotalSizeOfCanvas;

import {mouseDown} from "./modules/mouse_down"
window.mouseDown = mouseDown;

// add a click, either to local variables or to multiplayer hash
import {addClick} from "./modules/add_click"
window.addClick = addClick;


// bg: am i drawing the bg layer?
// original: should i draw myself to a canvas that is saved as an original? (disabled)
import {redraw} from "./modules/redraw"
window.redraw = redraw;







import {notifyMe} from "./modules/notify_me"
window.notifyMe = notifyMe;



import {scroll_to_bottom} from "./modules/scroll_to_bottom"
window.scroll_to_bottom = scroll_to_bottom;

import {init} from "./modules/init"
$(init);

import {loadVideoPlayer} from "./modules/load_video_player"
window.loadVideoPlayer = loadVideoPlayer;

import { start_pinging } from "./modules/start_pinging";
window.start_pinging = start_pinging;