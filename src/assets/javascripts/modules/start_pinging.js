export function start_pinging() {
    if (window.chat_channel) window.chat_channel.push("message_new", { name: window.name, ping: true, room: room, user_id: window.userId });
}