export function sformat(s) {
    var fm = [
        Math.floor(s / 60 / 60 / 24), // DAYS
        Math.floor(s / 60 / 60) % 24, // HOURS
        Math.floor(s / 60) % 60, // MINUTES
        s % 60 // SECONDS
    ];
    return $.map(fm, function (v, i) { return ((v < 10) ? '0' : '') + v; }).join(':');
}