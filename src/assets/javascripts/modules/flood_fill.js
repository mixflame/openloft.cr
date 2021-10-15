export const pointInPolygon = function (x, y, polygon) {
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

export const floodFill = function (context, x, y, color) {
    // const highest_layer = window.backupMpNameHash[window.name]
    var max;
    if (window.backupMpLayerOrder.length > 0)
        max = window.backupMpLayerOrder.length - 1;
    else
        max = 0;
    for (var z = max; z >= 0; --z) {
        // var path = [];
        var path = [];
        // console.log(z);
        if (window.backupMpClickHash[window.backupMpLayerOrder[z]]) {
            if (window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickX"]) {
                for (var i = 0; i < window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickX"].length; i++) {
                    var mx = window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickX"][i];
                    var my = window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickY"][i];
                    if (mx && my) {
                        path.push([mx, my]);
                    }
                }
            } else {
                path = window.backupMpClickHash[window.backupMpLayerOrder[z]]["clickPath"];
            }

            // console.log(path);
            // console.log(highest_layer);
            if (!window.dontLog) console.log("pip: " + pointInPolygon(x, y, path));
            if (pointInPolygon(x, y, path)) {
                // create fill layer on top
                context.beginPath();
                context.moveTo(path[0][0], path[0][1])
                for (var c = 1; c < path.length; c++) {
                    context.lineTo(path[c][0], path[c][1])
                }
                context.closePath();
                context.fillStyle = curColor;
                context.fill();
                addClick(undefined, undefined, undefined, false, name, curColor, undefined, undefined, path, curLineJoin, curShapeType, curShapeWidth, curShapeHeight, curShapeFill, curShapeAngle, curBrushStyle, count);
                window.canvas_channel.push("message_new", { room: room, x: undefined, y: undefined, dragging: false, name: name, color: curColor, size: undefined, text: undefined, path: path, line_join: curLineJoin, shape_type: curShapeType, shape_width: curShapeWidth, shape_height: curShapeHeight, shape_fill: curShapeFill, shape_angle: curShapeAngle, brush_style: curBrushStyle, count: count });

                break;
            }

        }
    }
}