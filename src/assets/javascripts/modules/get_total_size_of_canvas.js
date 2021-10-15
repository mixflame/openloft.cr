export function  getTotalSizeOfCanvas() {
    var size = 0;
    for (var j = 0; j < Object.keys(window.mpClickHash).length; j++) {
        var key = Object.keys(window.mpClickHash)[j];
        var hash = window.mpClickHash[key];
        var mpClickX = hash["clickX"];
        size = size + mpClickX.length;
    }
    return size;
}