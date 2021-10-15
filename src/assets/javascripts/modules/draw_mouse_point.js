export function drawMousePoint() {
    if (should_draw_brush) {
        if ($("#shape_type").val() == "rect") {
            context.strokeStyle = curColor;
            context.lineWidth = curSize;
            context.beginPath();
            context.rect(mouseBrushPt[0], mouseBrushPt[1], curShapeWidth, curShapeHeight);
            context.closePath();
            context.stroke();
            if (curShapeFill) {
                context.fillStyle = curColor;
                context.fill();
            }
        } else if ($("#shape_type").val() == "circle") {
            context.strokeStyle = curColor;
            context.lineWidth = curSize;
            context.beginPath();
            context.arc(mouseBrushPt[0], mouseBrushPt[1], curShapeWidth, 0, 2 * Math.PI);
            context.closePath();
            context.stroke();
            if (curShapeFill) {
                context.fillStyle = curColor;
                context.fill();
            }
        } else if ($("#shape_type").val() == "triangle") {
            context.strokeStyle = curColor;
            context.lineWidth = curSize;
            var R1 = parseInt(curShapeWidth),
                R2 = parseInt(curShapeHeight),
                R3 = parseInt(curShapeAngle);
            var Ax = 0,
                Ay = 0;
            var Bx = R3,
                By = 0;
            var Cx = (R2 * R1 + R3 * R3 - R1 * R1) / (2 * R3);
            var Cy = Math.sqrt(R2 * R2 - Cx * Cx);

            var Ox = mouseBrushPt[0] - Bx / 2;
            var Oy = mouseBrushPt[1] + Cy / 2;

            context.beginPath();
            context.moveTo(Ox + Ax, Oy - Ay);
            context.lineTo(Ox + Bx, Oy - By);
            context.lineTo(Ox + Cx, Oy - Cy);
            context.closePath();
            context.stroke();
            if (curShapeFill) {
                context.fillStyle = curColor;
                context.fill();
            }

        } else if ($("#shape_type").val() == "none") {
            if (!$("#text-tool").is(":checked")) {
                context.beginPath();
                context.moveTo(mouseBrushPt[0] - 1, mouseBrushPt[1]);
                context.lineTo(mouseBrushPt[0], mouseBrushPt[1]);
                context.closePath();
                context.strokeStyle = curColor;
                context.lineWidth = curSize;
                context.lineJoin = curLineJoin;
                context.stroke();
            } else {
                context.fillStyle = curColor;
                context.font = (curSize * 2).toString() + "px Arial";
                context.fillText(curText, mouseBrushPt[0], mouseBrushPt[1]);
            }
        }
    }
}