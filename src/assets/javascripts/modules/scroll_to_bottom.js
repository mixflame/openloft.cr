export function scroll_to_bottom() {
    var log = $('#chat_area')[0];
    if (log.scrollTop != log.scrollHeight) {
        // log.animate({ scrollTop: log.prop('scrollHeight')}, 100);
        log.scrollTop = log.scrollHeight;
        // setTimeout(window.scroll_to_bottom, 100);
    }
}