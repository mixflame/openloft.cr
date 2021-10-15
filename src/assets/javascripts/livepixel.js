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

window.room = window.location.toString().split("\/o\/")[1];

// renderGif not needed because of resolve
import { GiphyFetch } from '@giphy/js-fetch-api'

// create a GiphyFetch with your api key
// apply for a new Web SDK key. Use a separate key for every platform (Android, iOS, Web)
window.gf = new GiphyFetch('ZTlXzVf7OBMC3FDNZhYXZDk8mPPLerCA')

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

import {loadVideoPlayer} from "./modules/load_video_player"
window.loadVideoPlayer = loadVideoPlayer;

import { start_pinging } from "./modules/start_pinging";
window.start_pinging = start_pinging;

import {init} from "./modules/init"

// Load OpenLoft
$(init);

