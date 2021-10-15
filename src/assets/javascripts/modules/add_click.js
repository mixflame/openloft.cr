export function addClick(x, y, dragging, mp, click_name, color, size, text, path, line_join, shape_type, shape_width, shape_height, shape_fill, shape_angle, brush_style, count) {
    if (x == undefined &&
        y == undefined &&
        dragging == undefined &&
        mp == undefined &&
        click_name == undefined &&
        color == undefined &&
        text == undefined &&
        path == undefined) return;
    if (size > 35 || size < 1)
        size = 35;
    if (shape_width > 360 || shape_width < 1) {
        shape_width = 360;
    }
    if (shape_height > 360 || shape_height < 1) {
        shape_height = 360;
    }
    if (shape_angle > 360 || shape_angle < 1) {
        shape_angle = 360;
    }
    points.push([x, y])
    if (!mp) {
        var layerName;
        var layer;
        if (window.mpNameHash[click_name] == undefined) {
            if (!dontLog) console.log("Click hash undefined, redefining...");
            layer = 0;
            window.mpNameHash[click_name] = layer;
            layerName = click_name + "_" + layer;
            window.mpClickHash[layerName] = { clickX: new Array(), clickY: new Array(), clickDrag: new Array(), clickColor: new Array(), clickSize: new Array(), clickText: new Array(), clickPath: new Array(), clickLineJoin: new Array(), clickShapeType: new Array(), clickShapeWidth: new Array(), clickShapeHeight: new Array(), clickShapeFill: new Array(), clickShapeAngle: new Array(), clickBrushStyle: new Array(), clickCount: new Array() };
        } else {
            if (dragging == false) {
                layer = window.mpNameHash[click_name] + 1;
                window.mpNameHash[click_name] = layer;
                layerName = click_name + "_" + layer;
                window.mpClickHash[layerName] = { clickX: new Array(), clickY: new Array(), clickDrag: new Array(), clickColor: new Array(), clickSize: new Array(), clickText: new Array(), clickPath: new Array(), clickLineJoin: new Array(), clickShapeType: new Array(), clickShapeWidth: new Array(), clickShapeHeight: new Array(), clickShapeFill: new Array(), clickShapeAngle: new Array(), clickBrushStyle: new Array(), clickCount: new Array() };
            } else {
                layer = window.mpNameHash[click_name];
                window.mpNameHash[click_name] = layer;
                layerName = click_name + "_" + layer;
            }
        }
        if (window.backupMpNameHash[click_name] == undefined) {
            window.backupMpNameHash[click_name] = 0;
        } else {
            if (dragging == false) {
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
        window.mpClickHash[layerName]["clickBrushStyle"].push(brush_style);
        window.mpClickHash[layerName]["clickCount"].push(count);
        window.backupMpClickHash[click_name + "_" + window.backupMpNameHash[click_name]] = window.mpClickHash[layerName];
        if (!window.mpLayerOrder.includes(layerName)) {
            window.mpLayerOrder.push(layerName);
        }
        if (!window.backupMpLayerOrder.includes(click_name + "_" + window.backupMpNameHash[click_name])) {
            window.backupMpLayerOrder.push(click_name + "_" + window.backupMpNameHash[click_name]);
        }
        //$("#status").html("you are drawing (" + layer + " layers)");
    } else {
        var layerName;
        if (window.mpNameHash[click_name] == undefined) {
            if (!dontLog) console.log("Click hash undefined, redefining...");
            var layer = 0;
            window.mpNameHash[click_name] = layer;
            layerName = click_name + "_" + layer;
            window.mpClickHash[layerName] = { clickX: new Array(), clickY: new Array(), clickDrag: new Array(), clickColor: new Array(), clickSize: new Array(), clickText: new Array(), clickPath: new Array(), clickLineJoin: new Array(), clickShapeType: new Array(), clickShapeWidth: new Array(), clickShapeHeight: new Array(), clickShapeFill: new Array(), clickShapeAngle: new Array(), clickBrushStyle: new Array(), clickCount: new Array() };
        } else {
            if (dragging == false) {
                var layer = window.mpNameHash[click_name] + 1;
                window.mpNameHash[click_name] = layer;
                layerName = click_name + "_" + layer;
                window.mpClickHash[layerName] = { clickX: new Array(), clickY: new Array(), clickDrag: new Array(), clickColor: new Array(), clickSize: new Array(), clickText: new Array(), clickPath: new Array(), clickLineJoin: new Array(), clickShapeType: new Array(), clickShapeWidth: new Array(), clickShapeHeight: new Array(), clickShapeFill: new Array(), clickShapeAngle: new Array(), clickBrushStyle: new Array(), clickCount: new Array() };
            } else {
                var layer = window.mpNameHash[click_name];
                window.mpNameHash[click_name] = layer;
                layerName = click_name + "_" + layer;
            }
        }
        if (window.backupMpNameHash[click_name] == undefined) {
            window.backupMpNameHash[click_name] = 0;
        } else {
            if (dragging == false) {
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
        window.mpClickHash[layerName]["clickBrushStyle"].push(brush_style);
        window.mpClickHash[layerName]["clickCount"].push(count);
        window.backupMpClickHash[click_name + "_" + window.backupMpNameHash[click_name]] = window.mpClickHash[layerName];
        if (!window.mpLayerOrder.includes(layerName)) {
            window.mpLayerOrder.push(layerName);
        }
        if (!window.backupMpLayerOrder.includes(click_name + "_" + window.backupMpNameHash[click_name])) {
            window.backupMpLayerOrder.push(click_name + "_" + window.backupMpNameHash[click_name]);
        }
    }
}