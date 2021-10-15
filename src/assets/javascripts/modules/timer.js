export function startCount()
{
	window.call_timer = setInterval(count,1000);
    $("#chat_message").text(`${$("#realtime").text()} ${window.name} entered the call`);
    $("#send_message").click();
}

export function stopCount()
{
    clearInterval(window.call_timer);
    $("#chat_message").text(`${$("#realtime").text()} ${window.name} left the call`);
    $("#send_message").click();
}

export function count()
{
	var time_shown = $("#realtime").text();
        var time_chunks = time_shown.split(":");
        var hour, mins, secs;
 
        hour=Number(time_chunks[0]);
        mins=Number(time_chunks[1]);
        secs=Number(time_chunks[2]);
        secs++;
            if (secs==60){
                secs = 0;
                mins=mins + 1;
               } 
              if (mins==60){
                mins=0;
                hour=hour + 1;
              }
              if (hour==13){
                hour=1;
              }
 
        $("#realtime").text(hour +":" + plz(mins) + ":" + plz(secs));
 
}
 
export function plz(digit){
 
    var zpad = digit + '';
    if (digit < 10) {
        zpad = "0" + zpad;
    }
    return zpad;
}