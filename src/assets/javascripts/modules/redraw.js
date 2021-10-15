import {drawMousePoint} from "./draw_mouse_point"

export function redraw(bg, flatten) {
    if (context == undefined) {
        return;
    }
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    // context.fillStyle = "#FFFFFF";
    // context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // context.lineJoin = "round";

    context.imageSmoothingEnabled = true;

    if (bg) {
        // if(!dontLog) console.log("Drawing background canvas layer");
        // draw bgCanvas on canvas
        var destCtx = canvas.getContext('2d');
        destCtx.drawImage(window.bgCanvas, 0, 0);
    }

    // draw each user's canvas
    for (var j = 0; j < window.mpLayerOrder.length; j++) {
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
        var mpBrushStyle = hash["clickBrushStyle"];
        var mpClickCount = hash["clickCount"];
        for (var i = 0; i < mpClickX.length; i++) {
            if (mpShapeType[i] == "rect" || mpShapeType[i] == "circle" || mpShapeType[i] == "triangle") {
                switch (mpShapeType[i]) {
                    case "rect":
                        context.strokeStyle = mpClickColor[i];
                        context.lineWidth = mpClickSize[i];
                        context.beginPath();
                        context.rect(mpClickX[i], mpClickY[i], mpShapeWidth[i], mpShapeHeight[i]);
                        context.closePath();
                        context.stroke();
                        if (mpShapeFill[i]) {
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
                        if (mpShapeFill[i]) {
                            context.fillStyle = mpClickColor[i];
                            context.fill();
                        }
                        break;
                    case "triangle":
                        context.strokeStyle = mpClickColor[i];
                        context.lineWidth = mpClickSize[i];
                        var R1 = parseInt(mpShapeWidth[i]),
                            R2 = parseInt(mpShapeHeight[i]),
                            R3 = parseInt(mpShapeAngle[i]);
                        var Ax = 0,
                            Ay = 0;
                        var Bx = R3,
                            By = 0;
                        var Cx = (R2 * R1 + R3 * R3 - R1 * R1) / (2 * R3);
                        var Cy = Math.sqrt(R2 * R2 - Cx * Cx);

                        var Ox = mpClickX[i] - Bx / 2;
                        var Oy = mpClickY[i] + Cy / 2;

                        context.beginPath();
                        context.moveTo(Ox + Ax, Oy - Ay);
                        context.lineTo(Ox + Bx, Oy - By);
                        context.lineTo(Ox + Cx, Oy - Cy);
                        context.closePath();
                        context.stroke();
                        if (mpShapeFill[i]) {
                            context.fillStyle = mpClickColor[i];
                            context.fill();
                        }
                        break;
                }
            } else {
                if (mpClickPath[i]) {
                    const path = mpClickPath[i];
                    context.beginPath();
                    context.moveTo(path[0][0], path[0][1])
                    for (var c = 1; c < path.length; c++) {
                        context.lineTo(path[c][0], path[c][1])
                    }
                    context.closePath();
                    context.fillStyle = mpClickColor[i];
                    context.fill();
                } else {
                    if (mpClickText[i]) {
                        context.fillStyle = mpClickColor[i];
                        context.font = (mpClickSize[i] * 2).toString() + "px Arial";
                        context.fillText(mpClickText[i], mpClickX[i], mpClickY[i]);
                    } else {
                        if (mpBrushStyle[i] && mpBrushStyle[i] == "chrome") {
                            // openloft chrome brush
                            var dx, dy, d;




                            context.lineJoin = mpLineJoin[i];
                            context.beginPath();
                            if (mpClickDrag[i] && i) {
                                context.moveTo(mpClickX[i - 1], mpClickY[i - 1]);
                            } else {
                                context.moveTo(mpClickX[i] - 1, mpClickY[i]);
                            }
                            context.lineTo(mpClickX[i], mpClickY[i]);
                            context.closePath();
                            context.strokeStyle = mpClickColor[i];
                            context.lineWidth = mpClickSize[i];
                            context.stroke();


                            // dx = points[i][0] - points[mpClickCount[i]][0];
                            // dy = points[i][1] - points[mpClickCount[i]][1];
                            // console.log(mpClickX[mpClickX.length - 2]);
                            dx = (mpClickX[i - 5] ? mpClickX[i - 5] : mpClickX[0]) - mpClickX[i];
                            dy = (mpClickY[i - 5] ? mpClickY[i - 5] : mpClickY[0]) - mpClickY[i];
                            // dx = points[i][0] - mpClickX[mpClickX.length - 1];
                            // dy = points[i][1] - mpClickY[mpClickY.length - 1];
                            d = dx * dx + dy * dy;
                            // console.log(d);
                            if (d < 1000) {
                                // console.log(mpClickColor[i]);
                                try {
                                    context.strokeStyle = "rgba(" + hexToRgb(mpClickColor[i]).r + ", " + hexToRgb(mpClickColor[i]).g + ", " + hexToRgb(mpClickColor[i]).b + ", " + 0.1 * mpClickSize[i] + " )";
                                } catch {
                                    context.strokeStyle = mpClickColor[i];
                                }


                                context.beginPath();
                                context.moveTo(mpClickX[i] + (dx * 0.2), mpClickY[i] + (dy * 0.2));
                                context.lineTo(mpClickX[i] - (dx * 0.2), mpClickY[i] - (dy * 0.2));
                                context.stroke();
                                context.beginPath();
                                context.moveTo(mpClickX[i] - 1 + (dx * 0.4), mpClickY[i] - 1 + (dy * 0.4));
                                context.lineTo(mpClickX[i] - 1 - (dx * 0.4), mpClickY[i] - 1 - (dy * 0.4));
                                context.stroke();
                                context.beginPath();
                                context.moveTo(mpClickX[i] - 2 + (dx * 0.6), mpClickY[i] - 2 + (dy * 0.6));
                                context.lineTo(mpClickX[i] - 2 - (dx * 0.6), mpClickY[i] - 2 - (dy * 0.6));
                                context.stroke();
                                context.beginPath();
                                context.moveTo(mpClickX[i] - 3 + (dx * 0.8), mpClickY[i] - 3 + (dy * 0.8));
                                context.lineTo(mpClickX[i] - 3 - (dx * 0.8), mpClickY[i] - 3 - (dy * 0.8));
                                context.stroke();
                            }



                        } else if (mpBrushStyle[i] && mpBrushStyle[i] == "shaded") {

                            var dx, dy, d;


                            context.lineJoin = mpLineJoin[i];

                            // context.strokeStyle = mpClickColor[i];
                            context.lineWidth = mpClickSize[i];
                            // context.stroke();


                            // dx = points[i][0] - points[mpClickCount[i]][0];
                            // dy = points[i][1] - points[mpClickCount[i]][1];
                            // console.log(mpClickX[mpClickX.length - 2]);
                            dx = (mpClickX[i - 5] ? mpClickX[i - 5] : mpClickX[0]) - mpClickX[i];
                            dy = (mpClickY[i - 5] ? mpClickY[i - 5] : mpClickY[0]) - mpClickY[i];
                            // dx = points[i][0] - mpClickX[mpClickX.length - 1];
                            // dy = points[i][1] - mpClickY[mpClickY.length - 1];
                            d = dx * dx + dy * dy;
                            // console.log(d);
                            if (d < 1000 * parseInt(mpClickSize[i])) {
                                // try {
                                // console.log((1/(1 - (d / 5000)) * 0.1 * parseInt(mpClickSize[i])))
                                context.strokeStyle = "rgba(" + hexToRgb(mpClickColor[i]).r + ", " + hexToRgb(mpClickColor[i]).g + ", " + hexToRgb(mpClickColor[i]).b + ", " + (0.1 * (1 - (d / (1000 * parseInt(mpClickSize[i])))) * 0.1 * parseInt(mpClickSize[i])) + " )";
                                // } catch {
                                // context.strokeStyle = mpClickColor[i];
                                // }

                                context.beginPath();
                                context.moveTo(mpClickX[i - 1], mpClickY[i - 1]);
                                context.lineTo(mpClickX[i], mpClickY[i]);
                                context.closePath();
                                context.stroke();
                            }

                        } else {
                            context.lineJoin = mpLineJoin[i];
                            context.beginPath();
                            if (mpClickDrag[i] && i) {
                                context.moveTo(mpClickX[i - 1], mpClickY[i - 1]);
                            } else {
                                context.moveTo(mpClickX[i] - 1, mpClickY[i]);
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
    }

    if (flatten) {
        should_draw_brush = false;
        if (!dontLog) console.log("Transferring drawing to background canvas")
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