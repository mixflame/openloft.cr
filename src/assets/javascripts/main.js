import 'bootstrap';
import Amber from 'amber';

window.Amber = Amber;

import Ventus from 'ventus/dist/ventus.min.js';
var wm = new Ventus.WindowManager();
window.wm = wm;

const Automerge = require('automerge')
window.Automerge = Automerge;
let doc1 = Automerge.from({ text: "" })
window.doc1 = doc1;
//import Logo from '../images/logo.svg';

require("./livepixel")
require("./channels/canvas_channel")
require("./channels/chat_channel")
require("./channels/persistence_channel")
require("./channels/text_channel")

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
    faRulerCombined } from "@fortawesome/free-solid-svg-icons";


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


dom.watch();