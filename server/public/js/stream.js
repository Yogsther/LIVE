var stream = false;

document.getElementsByClassName("chat-container")[0].style.height = document.getElementById("stream-img").offsetHeight-4 + "px";

socket.emit("watch_stream", location.href.substr(location.href.indexOf("?")+1))

socket.on("stream", img => {
    document.getElementById("stream-img").src = img;
})

socket.on("stream_info", info => {
    if(info.stream) stream = info.stream
    document.getElementById("title-stream").innerText = info.title;
    document.getElementById("description-stream").innerText = info.description;
    if(info.viewers > 0){
        document.getElementById("viewercount").style.color = "#fc2145";
    } else {
        document.getElementById("viewercount").style.color = "#aaaaaa";
    }
    document.getElementById("viewercount").innerText = info.viewers;
    if(info.live){
        document.getElementsByClassName("viewers-icon")[0].style.background = "#fc2145";
    } else {
        document.getElementsByClassName("viewers-icon")[0].style.background = "#292929";
        document.getElementsByName("stream-img").src = "img/offline.png";
    }
})

socket.on("chat", pack => {
    var message = sanitizeHTML(pack.message);
    var emotes = pack.emotes;
    for(var emote of emotes){
        while(message.indexOf(":" + emote + ":") != -1) message = message.replace(":" + emote + ":", "<img src='emotes/" + emote + ".png' class='emote'>")
    }
    document.getElementsByClassName("messages")[0].innerHTML += '<div class="message"><span class="chat-content"><span class="chat-username">' + pack.username + ":</span> " + message + '</span></div>';
    document.getElementsByClassName("messages")[0].scrollTop = document.getElementsByClassName("messages")[0].scrollHeight;
})

document.getElementsByClassName("chat-input")[0].addEventListener("keydown", e => {
    if(e.key == "Enter"){
        socket.emit("chat", {
            stream: stream,
            message: e.srcElement.value,
            token: token
        })
        e.srcElement.value = "";
    }
});

function sanitizeHTML(str) {
	var temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};