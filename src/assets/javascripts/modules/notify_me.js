export function notifyMe(message) {
    if (!window.Notification) {
        if (!dontLog) console.log('Browser does not support notifications.');
    } else {
        // check if permission is already granted
        if (Notification.permission === 'granted') {
            // show notification here
            var notify = new Notification("OpenLoft Collaborative Editor", {
                body: message
            });
        } else {
            // request permission from user
            Notification.requestPermission().then(function (p) {
                if (p === 'granted') {
                    // show notification here
                    var notify = new Notification("OpenLoft Collaborative Editor", {
                        body: message
                    });
                } else {
                    if (!dontLog) console.log('User blocked notifications.');
                }
            }).catch(function (err) {
                console.error(err);
            });
        }
    }
}