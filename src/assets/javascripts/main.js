//import 'bootstrap';
import Amber from 'amber';
//import Logo from '../images/logo.svg';

require("./livepixel")

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
    faBars,
    faHeadphones,
    // faTwitter,
    faDownload,
    faPlug,
    // faRefresh,
    faCircleNotch,
    faStop,
    faPlay,
    faVolumeDown,
    faVolumeUp,
    faSearch,
    faTimesCircle,
    faSortAmountDown,
    faSortAmountUp,
    faFont,
    faHeart,
    faMusic } from "@fortawesome/free-solid-svg-icons";


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
library.add(faBars)
library.add(faHeadphones)
// library.add(faTwitter)
library.add(faDownload)
library.add(faPlug)
// library.add(faRefresh)
library.add(faCircleNotch)
library.add(faStop)
library.add(faPlay)
library.add(faVolumeDown)
library.add(faVolumeUp)
library.add(faSearch)
library.add(faTimesCircle)
library.add(faSortAmountDown)
library.add(faSortAmountUp)
library.add(faFont)
library.add(faHeart)
library.add(faMusic)

dom.watch();