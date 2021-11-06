import 'bootstrap';
import Amber from 'amber';

window.Amber = Amber;

import Ventus from 'ventus/dist/ventus.min.js';
var wm = new Ventus.WindowManager();
window.wm = wm;

const Automerge = require('automerge')
window.Automerge = Automerge;
let currentDoc = Automerge.init();
window.currentDoc = currentDoc;


const HtmlTextCollabExt = require("../../../node_modules/@cerulean/html-text-collab-ext/dist/es6/index.js");
window.HtmlTextCollabExt = HtmlTextCollabExt;

import lifecycle from "page-lifecycle/dist/lifecycle.es5.js"
window.lifecycle = lifecycle;

//import Logo from '../images/logo.svg';

require("./livepixel")
require("./channels/canvas_channel")
require("./channels/chat_channel")
require("./channels/persistence_channel")
require("./channels/text_channel")
require("./channels/theater_channel")

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faEyeDropper, 
    faEraser, 
    faParagraph, 
    faRainbow, 
    faMoon, 
    faFill, 
    faRuler, 
    faPalette, 
    faUndo, 
    faPaintBrush, 
    faShapes,
    faRulerCombined,
    faComment,
    faVideo,
    faFileAlt,
    faCog,
    faTv     } from "@fortawesome/free-solid-svg-icons";


library.add(faEyeDropper);
library.add(faEraser);
library.add(faParagraph);
library.add(faRainbow);
library.add(faMoon);
library.add(faFill);
library.add(faRuler);
library.add(faPalette);
library.add(faUndo);
library.add(faPaintBrush);
library.add(faShapes);
library.add(faRulerCombined);
library.add(faComment);
library.add(faFileAlt);
library.add(faCog);
library.add(faTv);
library.add(faVideo);


dom.watch();

require("mediaelement");
window.MediaElement = MediaElement;

require("mediaelement/build/renderers/dailymotion")
require("mediaelement/build/renderers/facebook")
require("mediaelement/build/renderers/soundcloud") // will work in production
require("mediaelement/build/renderers/twitch")
require("mediaelement/build/renderers/vimeo")
require("mediaelement/build/renderers/youtube")







import Polyglot from "node-polyglot"
window.polyglot = Polyglot;
window.i18n = new Polyglot();

// pass context.local from citrine-18n to window.i18n.locale