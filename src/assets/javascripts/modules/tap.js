import { rgbToHex, hexToRgb } from './hex_to_rgb';
import {floodFill} from "./flood_fill";

export function tap(e) {
    if (disabled) return;
    if (!e.touches) {
        var rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;
        var mouseX = (e.clientX - rect.left) * scaleX;
        var mouseY = (e.clientY - rect.top) * scaleY;
    } else {
        if (e.touches.length < 2) {
            var touch = event.touches[0];
            var mouseX = (touch.pageX - this.offsetLeft);
            var mouseY = (touch.pageY - this.offsetTop);
            var force = e.targetTouches[0].force;
        } else {
            return true;
        }

    }

    // mouseX = scaledPositionX(mouseX);
    // mouseY = scaledPositionY(mouseY);



    // $("#brush-size").val(force * 35);
    // curSize = $("#brush-size").val();

    if ($("#eyedropper").is(":checked")) {
        var canvasElement = $("#canvas")[0];
        var p = canvasElement.getContext('2d').getImageData(mouseX, mouseY, 1, 1).data;
        var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        if (!dontLog) console.log("hex: " + hex);
        $("#color").val(hex);
        $("#color").change();
        $("#eyedropper").prop("checked", false);
        e.preventDefault();
        return false;
    }

    // if($("#brush_style").val() != "none") {
    //   switch($("#brush_style").val()) {
    //     case "chrome":
    //       window.count = (window.count + 1) % 75;
    //       var color = rgbToHex(Math.floor(Math.random() * hexToRgb($("#color").val()).r), Math.floor(Math.random() * hexToRgb($("#color").val()).g), Math.floor(Math.random() * hexToRgb($("#color").val()).b));
    //       var hex = "#" + ("000000" + color).slice(-6);
    //       curColor = hex;
    //     }
    // }

    if ($("#paintbucket").is(":checked")) {
        // var imageData = window.context.getImageData(0, 0, 1180, 690);
        floodFill(context, mouseX, mouseY, curColor);
        return false;
    }

    paint = true;
    if ($("#text-tool").is(":checked"))
        addClick(mouseX, mouseY, false, false, name, curColor, curSize, curText, undefined, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle, curBrushStyle, count);
    else
        addClick(mouseX, mouseY, false, false, name, curColor, curSize, undefined, undefined, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle, curBrushStyle, count);
    if (getTotalSizeOfCanvas() > 2000) {
        window.redraw(true, true);
        // window.redraw(false, false);
    } else {
        window.redraw(true, false);
    }
    if ($("#text-tool").is(":checked"))
        window.canvas_channel.push("message_new", { room: room, x: mouseX, y: mouseY, dragging: false, name: name, color: curColor, size: curSize, text: curText, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle, brush_style: curBrushStyle, count: count });
    else
        window.canvas_channel.push("message_new", { room: room, x: mouseX, y: mouseY, dragging: false, name: name, color: curColor, size: curSize, text: undefined, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle, brush_style: curBrushStyle, count: count });
    e.preventDefault();
}

export function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

export function tapDrag(e) {

    if (disabled) return;
    if (!e.touches) {
        var rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;
        var mouseX = ((e.clientX - rect.left) * scaleX);
        var mouseY = ((e.clientY - rect.top) * scaleY);
    } else {
        if (e.touches.length < 2) {
            var touch = event.touches[0];
            var mouseX = (touch.pageX - this.offsetLeft);
            var mouseY = (touch.pageY - this.offsetTop);
            var force = e.targetTouches[0].force;
        } else {
            return true;
        }
    }

    // mouseX = scaledPositionX(mouseX);
    // mouseY = scaledPositionY(mouseY);



    // $("#brush-size").val(force * 35);
    // curSize = $("#brush-size").val();

    if ($("#random-brush-size").is(":checked")) {
        curSize = Math.floor(Math.random() * 35 + 1)
        curShapeWidth = Math.floor(Math.random() * 360 + 1)
        curShapeHeight = Math.floor(Math.random() * 360 + 1)
        curShapeAngle = Math.floor(Math.random() * 360 + 1)
    }

    // if($("#brush_style").val() != "none") {
    //   switch($("#brush_style").val()) {
    //     case "chrome":
    //       window.count = (window.count + 1) % 75;
    //       var color = rgbToHex(Math.floor(Math.random() * hexToRgb($("#color").val()).r), Math.floor(Math.random() * hexToRgb($("#color").val()).g), Math.floor(Math.random() * hexToRgb($("#color").val()).b));
    //       var hex = "#" + ("000000" + color).slice(-6);
    //       curColor = hex;
    //     }
    // }

    if ($("#rainbow").is(':checked')) {
        if ($("#themes").val() == "rain")
            curColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        else if ($("#themes").val() == "camo")
            curColor = camos[Math.floor(Math.random() * camos.length)];
        else if ($("#themes").val() == "bluesky")
            curColor = bluesky[Math.floor(Math.random() * bluesky.length)];
        else if ($("#themes").val() == "summerwave")
            curColor = summerwave[Math.floor(Math.random() * summerwave.length)];
        else if ($("#themes").val() == "relaxing")
            curColor = relaxing[Math.floor(Math.random() * relaxing.length)];
        else if ($("#themes").val() == "sunrise")
            curColor = sunrise[Math.floor(Math.random() * sunrise.length)];
        else if ($("#themes").val() == "pinksunrise")
            curColor = pink_sunrise[Math.floor(Math.random() * pink_sunrise.length)];
        else if ($("#themes").val() == "beigesky")
            curColor = beige_sky[Math.floor(Math.random() * beige_sky.length)];
        else if ($("#themes").val() == "oldschoolpixel")
            curColor = oldschool_pixel[Math.floor(Math.random() * oldschool_pixel.length)];
        else if ($("#themes").val() == "orangesunrise")
            curColor = orange_sunrise[Math.floor(Math.random() * orange_sunrise.length)];
        else if ($("#themes").val() == "purplesunset")
            curColor = purple_sunset[Math.floor(Math.random() * purple_sunset.length)];
        else if ($("#themes").val() == "grayhorizon")
            curColor = gray_horizon[Math.floor(Math.random() * gray_horizon.length)];
        else if ($("#themes").val() == "earlymorning")
            curColor = early_morning[Math.floor(Math.random() * early_morning.length)];
        else if ($("#themes").val() == "crimsonnight")
            curColor = crimson_night[Math.floor(Math.random() * crimson_night.length)];
        else if ($("#themes").val() == "twilightforest")
            curColor = twilight_forest[Math.floor(Math.random() * twilight_forest.length)];
        else if ($("#themes").val() == "forestmoon")
            curColor = forest_moon[Math.floor(Math.random() * forest_moon.length)];
        else if ($("#themes").val() == "burntsun")
            curColor = burnt_sun[Math.floor(Math.random() * burnt_sun.length)];
        else if ($("#themes").val() == "beforenight")
            curColor = before_night[Math.floor(Math.random() * before_night.length)];
    }

    if (paint) {
        if ($("#eyedropper").is(":checked")) {
            var canvasElement = $("#canvas")[0];
            var p = canvasElement.getContext('2d').getImageData(mouseX, mouseY, 1, 1).data;
            var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
            if (!dontLog) console.log("hex: " + hex);
            $("#color").val(hex);
            $("#color").change();
            e.preventDefault();
            return false;
        }


        if ($("#text-tool").is(":checked"))
            addClick(mouseX, mouseY, true, false, name, curColor, curSize, curText, undefined, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle, curBrushStyle, count);
        else
            addClick(mouseX, mouseY, true, false, name, curColor, curSize, undefined, undefined, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle, curBrushStyle, count);
        if (getTotalSizeOfCanvas() > 2000) {
            window.redraw(true, true);
            // window.redraw(false, false);
        } else {
            window.redraw(true, false);
        }
        if ($("#text-tool").is(":checked"))
            window.canvas_channel.push("message_new", { room: room, x: mouseX, y: mouseY, dragging: true, name: name, color: curColor, size: curSize, text: curText, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle, brush_style: curBrushStyle, count: count });
        else
            window.canvas_channel.push("message_new", { room: room, x: mouseX, y: mouseY, dragging: true, name: name, color: curColor, size: curSize, text: undefined, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle, brush_style: curBrushStyle, count: count });
    }

    mouseBrushPt[0] = mouseX;
    mouseBrushPt[1] = mouseY;
    window.redraw(true, false);
    e.preventDefault();
}