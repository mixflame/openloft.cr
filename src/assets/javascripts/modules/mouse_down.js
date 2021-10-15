export function mouseDown (mousedown_name, color, size) {
    if (mousedown_name.match(/^[a-z0-9]+$/i)) {
        $("#status").html("<font class='who-drew' color='" + color + "'>" + mousedown_name + "</font> is drawing");
        // $(".online-" + mousedown_name).remove();
        $(".online-" + mousedown_name).replaceWith('<li class="online-' + mousedown_name + '" style="color:' + color + ';">' + mousedown_name + '</li>')
    }
}