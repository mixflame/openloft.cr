import {tap, tapDrag} from "./tap"
import {toggleCamera, toggleMic} from "./toggle_camera_mic" 
import {base64ToBlob} from "./base64_to_blob"
import Amber from 'amber';
import { EmojiButton } from '@joeattardi/emoji-button';
import { gotDevices } from "./cam";

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


export function init() {

    $('[data-toggle="tab"]').tooltip()

    window.userId = $("#current-user")[0].innerHTML;

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
    if (isTabletOrPhone) {
        canvas.setAttribute('width', $("#canvasDiv").width());
        canvas.setAttribute('height', $("#canvasDiv").height());
    } else {
        canvas.setAttribute('width', 1280);
        canvas.setAttribute('height', 690);
    }
    canvas.setAttribute('id', 'canvas');
    canvas.setAttribute("style", "top: 0px; left: 0px; bottom: 0px; right: 0px;")
    // $(canvas).css("position", "absolute");
    // $(canvas).css("top", "0px");
    // $(canvas).css("left", "0px");
    // $(canvas).css("bottom", "0px");
    // $(canvas).css("right", "0px");
    window.canvas = canvas;

    var bgCanvasDiv = document.getElementById('bgCanvasDiv');
    window.bgCanvas = document.createElement('canvas');
    if (!isTabletOrPhone) {
        window.bgCanvas.setAttribute('width', 1280);
        window.bgCanvas.setAttribute('height', 690);
    } else {
        bgCanvas.setAttribute('width', $("#canvasDiv").width());
        bgCanvas.setAttribute('height', $("#canvasDiv").height());
    }
    window.bgCanvas.setAttribute('id', 'bgCanvas');

    $("#downloader").click(function () {
        document.getElementById("downloader").download = "image.png";
        document.getElementById("downloader").href = canvas.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    })

    $("#uploader").click(function (e) {
        var dataURL = canvas.toDataURL();
        if (!window.dontLog) console.log(dataURL);
        var url = "/upload_to_imgur";
        var base64ImageContent = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        var blob = base64ToBlob(base64ImageContent, 'image/png');
        var formData = new FormData();
        formData.append('picture', blob);

        const csrfToken = document.querySelector("[name=_csrf]").content;
        const headers = {
            "X-CSRF-TOKEN": csrfToken,
            "Access-Control-Allow-Origin": "*"
        }

        $.ajax({
            url: url,
            headers: headers,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            data: formData
        })
            .done(function (e) {
                var id = JSON.parse(e)["data"]["id"];
                // window.open(link);
                window.open("/gallery#" + id);
            });

        e.preventDefault();
    })

    // $("#clear_canvas").click(function (e) {
    //     $.get("/clear_canvas?room=" + room, function () {

    //     });
    //     e.preventDefault();
    // })

    canvas.addEventListener('touchstart', tap);
    canvas.addEventListener('touchmove', tapDrag);
    // canvasDiv.appendChild(bgCanvas);
    canvasDiv.appendChild(canvas);
    if (typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d");
    window.context = context;

    context.scale(scale, scale);

    $('#canvas').mousedown(tap);

    $('#canvas').mousemove(tapDrag);

    $('#canvas').mouseup(function (e) {
        // count = 0;
        window.edits = window.edits + 1;
        window.paint = false;
        // window.canvas_channel.push("message_new", { mouseUp: true, name: name, room: room });
    });

    $('#canvas').bind("touchend", function (e) {
        paint = false;
        // window.canvas_channel.push("message_new", { mouseUp: true, name: name, room: room });
    });

    $('#canvas').mouseleave(function (e) {
        paint = false;
        // window.canvas_channel.push("message_new", { mouseUp: true, name: name, room: room });
    });

    $(document).keydown(function (e) {
        if (!dontLog) console.log(e.which);
    });

    function setEndOfContenteditable(contentEditableElement) {
        var range, selection;
        if (document.createRange) //Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange(); //Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
            range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection(); //get the selection object (allows you to change selection)
            selection.removeAllRanges(); //remove any selections already made
            selection.addRange(range); //make the range you have just created the visible selection
        } else if (document.selection) //IE 8 and lower
        {
            range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement); //Select the entire contents of the element with the range
            range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
            range.select(); //Select the range (make it the visible selection
        }
    }

    $("#chat_message").keydown((e) => {
        console.log(e.which);
        if (e.which == 13) {
            return;
        }
        if (e.which == 9) {
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

                if (results == null) results = [];

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
        if ($(window.rainbow).is(":checked")) {
            if ($("#themes").val() == "rain")
                curTextColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
            else if ($("#themes").val() == "camo")
                curTextColor = camos[Math.floor(Math.random() * camos.length)];
            else if ($("#themes").val() == "bluesky")
                curTextColor = bluesky[Math.floor(Math.random() * bluesky.length)];
            else if ($("#themes").val() == "summerwave")
                curTextColor = summerwave[Math.floor(Math.random() * summerwave.length)];
            else if ($("#themes").val() == "relaxing")
                curTextColor = relaxing[Math.floor(Math.random() * relaxing.length)];
            else if ($("#themes").val() == "sunrise")
                curTextColor = sunrise[Math.floor(Math.random() * sunrise.length)];
            else if ($("#themes").val() == "pinksunrise")
                curTextColor = pink_sunrise[Math.floor(Math.random() * pink_sunrise.length)];
            else if ($("#themes").val() == "beigesky")
                curTextColor = beige_sky[Math.floor(Math.random() * beige_sky.length)];
            else if ($("#themes").val() == "oldschoolpixel")
                curTextColor = oldschool_pixel[Math.floor(Math.random() * oldschool_pixel.length)];
            else if ($("#themes").val() == "orangesunrise")
                curTextColor = orange_sunrise[Math.floor(Math.random() * orange_sunrise.length)];
            else if ($("#themes").val() == "purplesunset")
                curTextColor = purple_sunset[Math.floor(Math.random() * purple_sunset.length)];
            else if ($("#themes").val() == "grayhorizon")
                curTextColor = gray_horizon[Math.floor(Math.random() * gray_horizon.length)];
            else if ($("#themes").val() == "earlymorning")
                curTextColor = early_morning[Math.floor(Math.random() * early_morning.length)];
            else if ($("#themes").val() == "crimsonnight")
                curTextColor = crimson_night[Math.floor(Math.random() * crimson_night.length)];
            else if ($("#themes").val() == "twilightforest")
                curTextColor = twilight_forest[Math.floor(Math.random() * twilight_forest.length)];
            else if ($("#themes").val() == "forestmoon")
                curTextColor = forest_moon[Math.floor(Math.random() * forest_moon.length)];
            else if ($("#themes").val() == "burntsun")
                curTextColor = burnt_sun[Math.floor(Math.random() * burnt_sun.length)];
            else if ($("#themes").val() == "beforenight")
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



    $("#palette-selector").change(function () {
        window.palette = palettes[$("#palette-selector").val()]
        window.palette.forEach(function (e, i) {
            colorsUsed.push(e);
            var colors = colorsUsed.slice(Math.max(colorsUsed.length - 16, 0))
            colors.forEach((element, index) => {
                $("#last-color-" + index).css("background-color", element);
            });
        })
    })

    $("#palette-selector").change();


    $("#color").change(function () {
        curColor = $("#color").val();
        colorsUsed.push(curColor);
        var colors = colorsUsed.slice(Math.max(colorsUsed.length - 16, 0))
        colors.forEach((element, index) => {
            $("#last-color-" + index).css("background-color", element);
        });
    })

    $("#brush_type").change(function () {
        curLineJoin = $("#brush_type").val();
        window.curLineJoin = curLineJoin;
    })

    $("#brush_type").change();

    $("#shape_type").change(function () {
        curShapeType = $("#shape_type").val();
        if (curShapeType == "rect") {
            $("#a_param").show();
            $("#b_param").show();
            $("#c_param").hide();
            $("#a_label").html("w");
            $("#b_label").html("h");

        } else if (curShapeType == "circle") {
            $("#a_param").show();
            $("#b_param").hide();
            $("#c_param").hide();
            $("#a_label").html("r");

        } else if (curShapeType == "triangle") {
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

    $("#shape_width").keyup(function () {
        curShapeWidth = parseInt($("#shape_width").val());
        if (curShapeWidth > 360 || curShapeWidth < 1) {
            curShapeWidth = 360;
        }
        $("#shape_width").val(curShapeWidth);
        window.curShapeWidth = curShapeWidth;
    })

    $("#shape_height").keyup(function () {
        curShapeHeight = parseInt($("#shape_height").val());
        if (curShapeHeight > 360 || curShapeHeight < 1) {
            curShapeHeight = 360;
        }
        $("#shape_height").val(curShapeHeight);
        window.curShapeHeight = curShapeHeight;
    })

    $("#shape_angle").keyup(function () {
        curShapeAngle = parseInt($("#shape_angle").val());
        if (curShapeAngle > 360 || curShapeAngle < 1) {
            curShapeAngle = 360;
        }
        $("#shape_angle").val(curShapeAngle);
        window.curShapeAngle = curShapeAngle;
    })

    $("#shape_fill").change(function () {
        curShapeFill = $("#shape_fill").is(":checked");
        window.curShapeFill = curShapeFill;
    })

    $(".swatch").click(function (e) {
        var color = $(e.target).css("background-color");
        var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

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

    $("#brush-size").bind("input", function () {
        if (!dontLog) console.log("CurSize: " + curSize);
        curSize = $("#brush-size").val();
        if (curSize > 35 || curSize < 1)
            curSize = 35;
    })

    // clear chat on first load
    // $("#chat_area").val("");

    // chat ability
    $("#send_message").click(function () {
        var chat_message = $("#chat_message").html();
        if (chat_message != "") {
            if (window.last_message != chat_message) {
                window.chat_channel.push("message_new", { name: name, chat_message: chat_message, room: room });
                $("#chat_message").html("");
                window.last_message = chat_message
            } else {
                $("#chat_message").html("");
            }
        }
    });

    $("#chat_message").keyup(function (e) {
        if (e.keyCode == 13) {
            $("#send_message").trigger("click");
            e.preventDefault();
            document.execCommand("foreColor", true, $("#text_color").val());
        }
    });

    $("#private_room").click(function () {
        var code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        window.open("/canvas?room=" + code);
        return false;
    });

    $("#site_link").val(window.location);
    $(".shareon").data("url", window.location);

    $("#copy_link").click(function () {
        var copyText = document.getElementById("site_link");

        /* Select the text field */
        copyText.select();
        copyText.setSelectionRange(0, 99999); /* For mobile devices */

        /* Copy the text inside the text field */
        document.execCommand("copy");

        /* Alert the copied text */
        $("#copy_link").html("copied!")
        setTimeout(function () {
            $("#copy_link").html("copy link")
        }, 3000)
    })

    var chat_area = $('#chat_area');
    chat_area.scrollTop(chat_area[0].scrollHeight - chat_area.height());

    // onload


    $("#name").val(name);

    $("#name").change(function () {
        if ($("#name").val() != undefined && $("#name").val() != "" && $("#name").val().length < 30 && $("#name").val().match(/^[a-z0-9]+$/i)) {
            name = $("#name").val()
            window.name = name;
            localStorage.setItem("name", name);
            $("#cam-name").html(window.name);
        } else {
            $("#name").val(name);
        }
    });

    $("#eyedropper").change(function () {
        if ($("#eyedropper").is(":checked")) {
            $("#rainbow").prop("checked", false);
            $("#eraser").prop("checked", false);
            $("#text-tool").prop("checked", false);
            should_draw_brush = false;
        } else {
            should_draw_brush = true;
        }
    })

    $("#rainbow").bind("change", function () {
        if ($("#rainbow").is(":checked")) {
            $("#eyedropper").prop("checked", false);
            $("#eraser").prop("checked", false);
            window.oldColor = curColor;
        } else {
            curColor = window.oldColor;
        }
    });

    $("#text-tool").change(function () {
        $("#eyedropper").prop("checked", false);
        $("#eraser").prop("checked", false);
    })

    $("#text-to-write").keyup(function () {
        var badword = "avttre";
        var realbadword = badword.replace(/[a-zA-Z]/g, function (c) { return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26); });
        if ($("#text-to-write").val().toLowerCase().includes(realbadword)) {
            $("#text-to-write").val("Black Lives Matter");
        }
    })

    $("#eraser").bind("change", function () {
        if ($("#eraser").is(":checked")) {
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

    $("#text-to-write").keyup(function () {
        curText = $("#text-to-write").val();
        window.curText = curText;
    })

    // Pressure.set('#canvas', {
    //     start: function (event) {
    //         // this is called on force start
    //     },
    //     end: function () {
    //         // this is called on force end
    //     },
    //     startDeepPress: function (event) {
    //         // this is called on "force click" / "deep press", aka once the force is greater than 0.5
    //     },
    //     endDeepPress: function () {
    //         // this is called when the "force click" / "deep press" end
    //     },
    //     change: function (force, event) {
    //         // this is called every time there is a change in pressure
    //         // 'force' is a value ranging from 0 to 1
    //         console.log(force)
    //         $("#brush-size").val(force * 35);
    //         curSize = $("#brush-size").val();
    //     },
    //     unsupported: function () {
    //         // console.log("unsupported...");
    //         // NOTE: this is only called if the polyfill option is disabled!
    //         // this is called once there is a touch on the element and the device or browser does not support Force or 3D touch
    //     }
    // }, { polyfill: true });

    var date = new Date();
    // is it october or november?
    if (date.getMonth() + 1 == 10) {
        // halloween mode
        let borders = ["pumpkin", "spiderweb", "tomb", "bat"];
        var border = borders[Math.floor(Math.random() * borders.length)];
        if (!dontLog) console.log("border: " + border);
        $("canvas").addClass(border);
    } else if (date.getMonth() + 1 == 11) {
        let borders = ["feather", "pilgrim_hat", "pumpkin", "pumpkin_pie"];
        var border = borders[Math.floor(Math.random() * borders.length)];
        if (!dontLog) console.log("border: " + border);
        $("canvas").addClass(border);
    }

    // welcome message
    // window.notifyMe("Welcome to OpenLoft Collaborative Editor, " + name + "! All edits made will be seen live by all visitors of this site. Updates are persisted. Please consider buying an ad to support the development of this site.");

    // cam
    $("#input").val("cam");

    // $("#cam-name").html(`you: ${window.name}`);

    if (context) {
        redraw();
    }

    $("#join-button").click(function () {
        // $("#leave-button").click()
        if (window.video_connected == true) return;
        window.connectVideo();
    })

    $("#join-audio-button").click(function () {
        // $("#leave-button").click()
        if (window.video_connected == true) return;
        window.connectVideo(false);
    })

    $("#leave-button").click(function () {
        if (window.video_connected == false) return;
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

    $("#call-volume").on("input", function () {
        $("video").each(function (e, i) { i.volume = $("#call-volume").val() })
    })

    $("#undo").click(() => {
        $("#undo").prop("disabled", true);
        // if(window.edits <= 0) return;
        window.canvas_channel.push("message_new", { name: window.name, undo: true, room: room });
    })

    $("#text_color").change(function () {
        if (!$("#chat_message").is(":focus")) $("#chat_message").focus();
        // document.execCommand("styleWithCss", false, false);
        document.execCommand("foreColor", true, $("#text_color").val());
    })

    $("#chat_message").click(function () {
        document.execCommand("foreColor", true, $("#text_color").val());
    })



    $("#text_back_color").change(function () {
        if (!$("#chat_message").is(":focus")) $("#chat_message").focus();
        // document.execCommand("styleWithCss", false, false);
        document.execCommand("backColor", false, $("#text_back_color").val());
    })

    document.querySelector(".actions").addEventListener("mousedown", function (e) {
        var action = e.target.dataset.action;
        if (!$("#chat_message").is(":focus")) $("#chat_message").focus();
        if (!window.dontLog) console.log(action);
        if (action && action != "createLink" && action != "insertImage" && action != "searchGiphy" && action != "insertHTML") {
            document.execCommand(action, false)
            //prevent button from actually getting focused
            e.preventDefault();
        } else if (action == "insertImage") {
            var sLnk = prompt('Enter a URL', 'http:\/\/');
            if (sLnk && sLnk != '' && sLnk != 'http://') {
                document.execCommand('insertHTML', false, '<a href="' + sLnk + '" target="_blank"><img width="25%" height="25%" src="' + sLnk + '" /></a>');
            }
        } else if (action == "createLink") {
            var sLnk = prompt('Enter a URL', 'http:\/\/');
            if (sLnk && sLnk != '' && sLnk != 'http://') {
                document.execCommand('insertHTML', false, '<a href="' + sLnk + '" target="_blank">' + sLnk + '</a>');
            }
        } else if (action == "searchGiphy") {
            var q = prompt('Enter gif search terms', '');
            gf.search(q).then((f) => {
                console.log(f['data'][0]['id']);
                document.execCommand("insertImage", false, "https://i.giphy.com/media/" + f['data'][0]['id'] + "/giphy.gif")
            })
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

    $("img").one("load", function () {
        window.scroll_to_bottom();
    });

    window.scroll_to_bottom();

    // require("livepixel/somafm")

    $("#full-screen").click(function () {
        $("#canvas_tab").bind("resize", function () {
            var w = screen.width * 0.86;
            var h = screen.height * 0.86;

            $("#canvasDivHolder").css("width", w + "px");
            $("#canvasDivHolder").css("height", h + "px");
            $("#canvasDiv").css("width", w + "px");
            $("#canvasDiv").css("height", h + "px");
            $("canvas").css("width", w + "px");
            $("canvas").css("height", h + "px");
        });



        // var w = screen.width;
        // var h = screen.height;

        // window.canvas_window.resize(w, h)

        $('.nav-tabs button[href="#canvas_tab"]').tab('show');



        //using HTML5 for fullscreen (only newest Chrome + FF)

        $("#canvas_tab")[0].requestFullscreen(); //Firefox

    })

    $(".dropdown-item").click((e) => {
        var type = $(e.currentTarget).html();
        console.log(type);
        $("#input").val(type);
        $("#input").change();
    })

    setInterval(function () {
        $.getJSON("/random_ad", "", function (data) {
            let ad = data["ad"];
            let link = data["banner_link"];
            if (ad != "" && link != "") {
                $("#gbaldvertisement_link").prop("href", link);
                $("#gbaldvertisement_img").prop("src", `data:image/png;base64,${ad}`);
            }
        })
    }, 30000);

    $("#brush_style").change(function () {
        curBrushStyle = $("#brush_style").val();
        count = 0;
    })

    $("#brush_style").val("none");

    $("#brush_style").change();

    if (navigator.mediaDevices) navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(() => console.log("error enumeration devices"));

    if (false) { // windowing system disabled
        window.canvas_window = wm.createWindow.fromQuery('#canvasDivHolder', {
            title: 'Collaborative Canvas',
            width: screen.width * 0.60,
            height: screen.height * 0.60,
            x: 0,
            y: 0,
            animations: false,
            opacity: 1,
            events: {
                closed: function () {
                    this.open();
                }
            }
        })
        window.canvas_window.open().then(function () {
            console.log("canvas window opened")
            $("canvas").css("width", "100%");
            $("canvas").css("height", "100%");
            $("#canvasDiv").css("width", "100%");
            $("#canvasDiv").css("height", "100%");
            $("#Holder").css("width", "100%");
            $("#canvasDivHolder").css("height", "100%");
            // $(".wm-overlay").remove()
            canvas_window.maximize = function () {
                if (canvas_window.width != screen.width) {

                    window.previous_canvas_size = { x: canvas_window.x, y: canvas_window.y, width: canvas_window.width, height: canvas_window.height }
                    window.canvas_window.x = 0;
                    window.canvas_window.y = 0;
                    canvas_window.width = screen.width;
                    canvas_window.height = screen.height
                } else {
                    canvas_window.width = window.previous_canvas_size["width"];
                    canvas_window.height = window.previous_canvas_size["height"];
                    canvas_window.x = window.previous_canvas_size["x"];
                    canvas_window.y = window.previous_canvas_size["y"];
                }
            }
            window.canvas_window.resize = function (e, t) {

                window.canvas_window.width = e;
                window.canvas_window.height = t;

                $("canvas").css("width", "100%");
                $("canvas").css("height", "100%");
                $("#canvasDiv").css("width", "100%");
                $("#canvasDiv").css("height", "100%");
                $("#canvasDivHolder").css("width", "100%");
                $("#canvasDivHolder").css("height", "100%");
            }
            // window.canvas_window.resize(screen.width, screen.height);
        });

        window.chat_window = wm.createWindow.fromQuery('#chat_area_holder', {
            title: 'Gbalchat',
            width: 521,
            height: 585,
            x: 1285,
            y: 480,
            animations: false,
            opacity: 1,
            events: {
                closed: function () {
                    this.open();
                }
            }
        })

        window.chat_window.open().then(() => {
            console.log("chat opened");
            // $(window.chat_window.view.el).css("background-color", "black")
            $("#online_list").css("height", chat_window.height * 0.70)
            $("#chat_area").css("height", chat_window.height * 0.70)
            // $(".wm-overlay").remove()
            window.scroll_to_bottom();
            chat_window.maximize = function () {
                if (chat_window.width != screen.width) {
                    window.previous_chat_size = { x: chat_window.x, y: chat_window.y, width: chat_window.width, height: chat_window.height }
                    window.chat_window.x = 0;
                    window.chat_window.y = 0;
                    chat_window.width = screen.width;
                    chat_window.height = screen.height
                    $("#online_list").css("height", chat_window.height * 0.70)
                    $("#chat_area").css("height", chat_window.height * 0.70)
                } else {
                    chat_window.width = window.previous_chat_size["width"];
                    chat_window.height = window.previous_chat_size["height"];
                    $("#online_list").css("height", chat_window.height * 0.70)
                    $("#chat_area").css("height", chat_window.height * 0.70)
                    chat_window.x = window.previous_chat_size["x"];
                    chat_window.y = window.previous_chat_size["y"];
                }
            }
            window.chat_window.resize = function (e, t) {

                window.chat_window.width = e;
                window.chat_window.height = t;

                // $("#online_list").css("width", window.chat_window.width)
                $("#online_list").css("height", chat_window.height * 0.70)
                $("#chat_area").css("height", chat_window.height * 0.70)

                window.scroll_to_bottom();

            }
        })


        window.video_chat_window = wm.createWindow.fromQuery('#video_chat', {
            title: `Gbalcam`,
            width: 576,
            height: 420,
            x: 724,
            y: 693,
            animations: false,
            opacity: 1,
            events: {
                closed: function () {
                    this.open();
                }
            }
        })

        window.video_chat_window.open().then(() => {
            console.log("video chat opened");
            // $(window.video_chat_window.view.el).css("background-color", "black")
            // $(".wm-overlay").remove()
            $("#video_chat").css("width", window.video_chat_window.width)
            $("#video_chat").css("height", window.video_chat_window.height)
            video_chat_window.maximize = function () {
                if (video_chat_window.width != screen.width) {
                    window.previous_video_chat_size = { x: video_chat_window.x, y: video_chat_window.y, width: video_chat_window.width, height: video_chat_window.height }
                    window.video_chat_window.x = 0;
                    window.video_chat_window.y = 0;
                    video_chat_window.width = screen.width;
                    video_chat_window.height = screen.height
                    // $("#video_chat").css("width", window.video_chat_window.width)
                    // $("#video_chat").css("height", window.video_chat_window.height)
                } else {
                    video_chat_window.width = window.previous_video_chat_size["width"];
                    video_chat_window.height = window.previous_video_chat_size["height"];
                    $("#video_chat").css("width", window.video_chat_window.width)
                    $("#video_chat").css("height", window.video_chat_window.height)
                    video_chat_window.x = window.previous_video_chat_size["x"];
                    video_chat_window.y = window.previous_video_chat_size["y"];
                }
            }
            window.video_chat_window.resize = function (e, t) {

                window.video_chat_window.width = e;
                window.video_chat_window.height = t;

                $("#video_chat").css("width", window.video_chat_window.width)
                $("#video_chat").css("height", window.video_chat_window.height)
            }
        })

        window.tool_window = wm.createWindow.fromQuery('#toolbox', {
            title: 'Graphics Toolbox',
            width: 140,
            height: $("#toolbox").css("height"),
            x: 1280,
            y: 0,
            animations: false,
            resizable: false,
            opacity: 1,
            events: {
                closed: function () {
                    this.open();
                }
            }
        })

        window.tool_window.open().then(() => {
            console.log("tool window opened");

        })


        window.link_window = wm.createWindow.fromQuery('.navbar-nav', {
            title: 'Tools',
            width: 290,
            height: 379,
            x: 429,
            y: 693,
            animations: false,
            resizable: false,
            opacity: 1,
            events: {
                closed: function () {
                    this.open();
                }
            }
        })


        window.link_window.open().then(() => {
            console.log("link opened");
            // $(window.link_window.view.el).css("background-color", "black")
            // $(".wm-overlay").remove()
            $(".navbar-nav").css("width", window.link_window.width)
            $(".navbar-nav").css("height", window.link_window.height)
            link_window.maximize = function () {
                if (link_window.width != screen.width) {
                    link_window.width = screen.width;
                    link_window.height = screen.height
                } else {
                    link_window.width = 500;
                    link_window.height = 500;
                }
            }
            window.link_window.resize = function (e, t) {

                window.link_window.width = e;
                window.link_window.height = t;

                $(".navbar-nav").css("width", window.link_window.width)
                $(".navbar-nav").css("height", window.link_window.height)
            }
        })

        window.text_window = wm.createWindow.fromQuery('#collaborative_text_holder', {
            title: 'Gbalpad',
            width: 418,
            height: 245,
            x: 4,
            y: 693,
            animations: false,
            resizable: true,
            opacity: 1,
            events: {
                closed: function () {
                    this.open();
                }
            }
        })


        window.text_window.open().then(() => {
            console.log("text opened");
            // $(window.text_window.view.el).css("background-color", "black")
            selectionManager.onResize();
            // $(".wm-overlay").remove()
            $("#collaborative_text_holder").css("width", window.text_window.width)
            $("#collaborative_text_holder").css("height", window.text_window.height)

            $(".text-collab-ext").css("width", window.text_window.width)
            $(".text-collab-ext").css("height", window.text_window.height)
            text_window.maximize = function () {
                if (text_window.width != screen.width) {

                    window.previous_text_size = { x: text_window.x, y: text_window.y, width: text_window.width, height: text_window.height }
                    window.text_window.x = 0;
                    window.text_window.y = 0;
                    text_window.width = screen.width;
                    text_window.height = screen.height
                    $("#collaborative_text_holder").css("width", window.text_window.width)
                    $("#collaborative_text_holder").css("height", window.text_window.height)
                    $(".text-collab-ext").css("width", window.text_window.width)
                    $(".text-collab-ext").css("height", window.text_window.height)
                } else {
                    text_window.width = window.previous_text_size["width"];
                    text_window.height = window.previous_text_size["height"];
                    $("#collaborative_text_holder").css("width", window.text_window.width)
                    $("#collaborative_text_holder").css("height", window.text_window.height)
                    text_window.x = window.previous_text_size["x"];
                    text_window.y = window.previous_text_size["y"];
                    $(".text-collab-ext").css("width", window.text_window.width)
                    $(".text-collab-ext").css("height", window.text_window.height)
                }
                selectionManager.onResize();
            }
            window.text_window.resize = function (e, t) {

                window.text_window.width = e;
                window.text_window.height = t;

                $("#collaborative_text_holder").css("width", window.text_window.width)
                $("#collaborative_text_holder").css("height", window.text_window.height)
                selectionManager.onResize();
            }
        })

    }


    $("#tshirt-uploader").click(function (e) {
        e.preventDefault();
        var dataURL = canvas.toDataURL();
        if (!window.dontLog) console.log(dataURL);
        var url = "/upload_to_scalable_press";
        var base64ImageContent = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        var blob = base64ToBlob(base64ImageContent, 'image/png');
        var formData = new FormData();
        formData.append('picture', blob);

        const csrfToken = document.querySelector("[name=_csrf]").content;
        const headers = {
            "X-CSRF-TOKEN": csrfToken,
            "Access-Control-Allow-Origin": "*"
        }

        $.ajax({
            url: url,
            headers: headers,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            data: formData
        })
            .done(function (e) {
                var data = JSON.parse(e);

                console.log(data);

                window.open("/show_scalable_product_categories?designId=" + data["designId"])

            });


    })

    window.textarea = document.getElementById("collaborative_text");

    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;

    window.textEditor = new HtmlTextCollabExt.CollaborativeTextArea({
        control: textarea,
        onInsert: (index, value) => {
            console.log(`"${value}" was inserted at index ${index}`)
            var newDoc = Automerge.change(currentDoc, doc => {
                if (!doc.text)
                    doc.text = new Automerge.Text()
                doc.text.insertAt(index, value);
            })
            // let changes = Automerge.getChanges(currentDoc, newDoc);
            // let base64 = btoa(String.fromCharCode.apply(null, changes[0]));
            window.text_channel.push("message_new", { operation: "insert", value: value, index: index, user_id: currentUser, room: room, name: window.name });
            currentDoc = newDoc;
        },
        onDelete: (index, length) => {
            console.log(`"${length}" characters were deleted at index ${index}`)
            var newDoc = Automerge.change(currentDoc, doc => {
                if (!doc.text)
                    doc.text = new Automerge.Text()
                doc.text.deleteAt(index, length);
            })
            // let changes = Automerge.getChanges(currentDoc, newDoc);
            // let base64 = btoa(String.fromCharCode.apply(null, changes[0]));
            window.text_channel.push("message_new", { operation: "delete", index: index, length: length, user_id: currentUser, room: room, name: window.name });
            currentDoc = newDoc;
        },
        onSelectionChanged: (selection) => {
            console.log(`selection was changed to ${JSON.stringify(selection)}`)
            window.text_channel.push("message_new", { operation: "selection", anchor: selection["anchor"], target: selection["target"], user_id: currentUser, room: room, name: window.name });
        }
    })

    window.selectionManager = textEditor.selectionManager();


    // do this last...

    persistence_socket.connect()
        .then(setupPersistence)
    window.persistence_socket._reconnect = () => {
        clearTimeout(window.persistence_socket.reconnectTimeout)
        window.persistence_socket.reconnectTimeout = setTimeout(() => {
            window.persistence_socket.reconnectTries++
            window.persistence_socket.connect(window.persistence_socket.params).then(setupPersistence);
            window.persistence_socket._reconnect()
        }, window.persistence_socket._reconnectInterval())
    }
    

    if(!window.location.origin.includes("localhost"))
        $("#join-button").click();



    var pageVisibility = document.visibilityState;

    document.addEventListener("onbeforeunload", function (e) {
        e.stopPropagation();
        // try {window.camera_session.leave();} catch(e) { console.log(e) }
        try { window.canvas_channel.leave(); } catch (e) { console.log(e) }
        try { window.chat_channel.leave(); } catch (e) { console.log(e) }
        try { window.persistence_channel.leave(); } catch (e) { console.log(e) }
        try { window.text_channel.leave(); } catch (e) { console.log(e) }

        // handleLeaveSession();
    })

    document.addEventListener("pagehide", function (e) {
        e.stopPropagation();
        // try {window.camera_session.leave();} catch(e) { console.log(e) }


        try { window.canvas_channel.leave(); } catch (e) { console.log(e) }
        try { window.chat_channel.leave(); } catch (e) { console.log(e) }
        try { window.persistence_channel.leave(); } catch (e) { console.log(e) }
        try { window.text_channel.leave(); } catch (e) { console.log(e) }
        try { window.theater_channel.leave(); } catch (e) { console.log(e) }
        window.canvas_socket.close()
        window.chat_socket.close()
        window.persistence_socket.close()
        window.text_socket.close()
        window.theater_channel.close()
        // handleLeaveSession();
    })

    document.addEventListener("unload", function (e) {
        e.stopPropagation();
        // try {window.camera_session.leave();} catch(e) { console.log(e) }


        try { window.canvas_channel.leave(); } catch (e) { console.log(e) }
        try { window.chat_channel.leave(); } catch (e) { console.log(e) }
        try { window.persistence_channel.leave(); } catch (e) { console.log(e) }
        try { window.text_channel.leave(); } catch (e) { console.log(e) }
        try { window.theater_channel.leave(); } catch (e) { console.log(e) }

        window.canvas_socket.close()
        window.chat_socket.close()
        window.persistence_socket.close()
        window.text_socket.close()
        window.theater_channel.close()
        // handleLeaveSession();
    })

    // subscribe to visibility change events
    // document.addEventListener('visibilitychange', function () {
    //     // fires when user switches tabs, apps, goes to homescreen, etc.
    //     if (document.visibilityState == 'hidden') {
    //         // try {window.camera_session.leave();} catch(e) { console.log(e) }
    //         try { window.canvas_channel.leave(); } catch (e) { console.log(e) }
    //         try { window.chat_channel.leave(); } catch (e) { console.log(e) }
    //         try { window.persistence_channel.leave(); } catch (e) { console.log(e) }
    //         try { window.text_channel.leave(); } catch (e) { console.log(e) }

    //         // handleLeaveSession();
    //     }

    //     // fires when app transitions from prerender, user returns to the app / tab.
    //     if (document.visibilityState == 'visible') {
    //         window.canvas_socket = new Amber.Socket('/canvas')
    //         window.canvas_socket.connect()
    //             .then(setupCanvas)
    //         window.canvas_socket._reconnect = () => {
    //             clearTimeout(window.canvas_socket.reconnectTimeout)
    //             window.canvas_socket.reconnectTimeout = setTimeout(() => {
    //                 window.canvas_socket.reconnectTries++
    //                 window.canvas_socket.connect(window.canvas_socket.params).then(setupCanvas);
    //                 window.canvas_socket._reconnect()
    //             }, window.canvas_socket._reconnectInterval())
    //         }
    //         window.chat_socket = new Amber.Socket('/chat')
    //         chat_socket.connect()
    //             .then(setupChat)
    //         window.chat_socket._reconnect = () => {
    //             clearTimeout(window.chat_socket.reconnectTimeout)
    //             window.chat_socket.reconnectTimeout = setTimeout(() => {
    //                 window.chat_socket.reconnectTries++
    //                 window.chat_socket.connect(window.chat_socket.params).then(setupChat);
    //                 window.chat_socket._reconnect()
    //             }, window.chat_socket._reconnectInterval())
    //         }
    //         window.text_socket = new Amber.Socket('/text')
    //         text_socket.connect()
    //             .then(setupText)
    //         window.text_socket._reconnect = () => {
    //             clearTimeout(window.text_socket.reconnectTimeout)
    //             window.text_socket.reconnectTimeout = setTimeout(() => {
    //                 window.text_socket.reconnectTries++
    //                 window.text_socket.connect(window.text_socket.params).then(setupText);
    //                 window.text_socket._reconnect()
    //             }, window.text_socket._reconnectInterval())
    //         }

    //         persistence_socket.connect()
    //             .then(setupPersistence)
    //         window.persistence_socket._reconnect = () => {
    //             clearTimeout(window.persistence_socket.reconnectTimeout)
    //             window.persistence_socket.reconnectTimeout = setTimeout(() => {
    //                 window.persistence_socket.reconnectTries++
    //                 window.persistence_socket.connect(window.persistence_socket.params).then(setupPersistence);
    //                 window.persistence_socket._reconnect()
    //             }, window.persistence_socket._reconnectInterval())
    //         }
    //         window.camera_socket = new Amber.Socket('/session')
    //         camera_socket.connect()
    //             .then(setupSession)
    //         window.camera_socket._reconnect = () => {
    //             clearTimeout(window.camera_socket.reconnectTimeout)
    //             window.camera_socket.reconnectTimeout = setTimeout(() => {
    //                 window.camera_socket.reconnectTries++
    //                 window.camera_socket.connect(window.camera_socket.params).then(() => {
    //                     // handleLeaveSession();
    //                     setupSession();
    //                     // handleJoinSession();
    //                 });
    //                 window.camera_socket._reconnect()
    //             }, window.camera_socket._reconnectInterval())
    //         }
    //     }
    // });


    $("#online_list").css("height", $("#chat_area").height());

    $('button[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        //this method is very important and e.target below refers to current element which is equal to "this"
        var target = $(e.target).attr('aria-controls') // newly activated tab
        //fetch any of the data from target element and use it to change the url or content
        console.log(target)
        if (target == "chat_tab") {
            window.scroll_to_bottom();
        }
    })

    // var tabs = document.querySelectorAll('button[data-toggle="tab"]')

    // for (let index = 0; index < tabs.length; index++) {
    //     const element = tabs[index];
    //     element.addEventListener("click", function (e) {
    //         if (e.currentTarget.id != "call_tab-tab") {
    //             if (document.pictureInPictureEnabled && !window.pip_mode) {
    //                 var videos = $("video");
    //                 if(videos.length > 2) {
    //                     for (var i = 0; i < videos.length; i++) {
    //                         const v = videos[i];
    //                         try {
    //                             v.requestPictureInPicture()
    //                         } catch (e) {
    //                             console.log("Couldn't enable PiP mode. " + e.message);
    //                         }
    //                     }
    //                 }
    //                 window.pip_mode = true
    //             }
    //         } else {
    //             if (document.pictureInPictureEnabled && window.pip_mode) {
    //                 try {
    //                     document.exitPictureInPicture()
    //                 } catch (e) {
    //                     console.log("Couldn't disable PiP mode. " + e.message);
    //                 }
    //                 window.pip_mode = false
    //             }
    //         }
    //     })
    // }



    $("#cam-name").html(window.name);

    $("#theater_url_button").click(function () {
        $(".youtube-video").attr("src", $("#theater_url").val());
        theater_channel.push("message_new", { event: "load", url: $("#theater_url").val(), room: window.room, name: window.name, userId: window.userId });

        loadVideoPlayer();

    })

    $("#theme_select").change(function(e){
        var selected_theme = $("#theme_select").val();
        // set current theme
        $("#theme_link").prop("href", "/stylesheets/themes/" + selected_theme);
        var csrf = document.querySelector("[name=_csrf]").content;
        const headers = {
            "content-type": "application/json",
            "X-CSRF-TOKEN": csrf,
        }
        $.ajax({
            url: "/change_theme",
            headers: headers,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            data: JSON.stringify({ theme: selected_theme }),
            dataType: "json"
        })
        .done(function (e) {
            // $("[name*=_csrf]").replaceWith(e['csrf']);
        });
      })

    $("#theme_select").change();

    $('.nav-tabs button[href="#call_tab"]').tab('show');

    if(room == "gbalda") {
        $("#call_tab").remove();
        $("#call_tab-tab").remove();
        $('.nav-tabs button[href="#canvas_tab"]').tab('show');
    }

}