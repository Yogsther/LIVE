var stream = false;

document.getElementsByClassName("chat-container")[0].style.height = document.getElementById("stream-img").offsetHeight - 4 + "px";

socket.emit("watch_stream", location.href.substr(location.href.indexOf("?") + 1))

socket.on("stream", img => {
    document.getElementById("stream-img").src = img;
})

socket.on("stream_info", info => {
    if (info.stream) stream = info.stream
    document.getElementById("title-stream").innerText = info.title;
    document.getElementById("description-stream").innerText = info.description;
    if (info.viewers > 0) {
        document.getElementById("viewercount").style.color = "#fc2145";
    } else {
        document.getElementById("viewercount").style.color = "#aaaaaa";
    }
    document.getElementById("viewercount").innerText = info.viewers;
    if (info.live) {
        document.getElementsByClassName("viewers-icon")[0].style.background = "#fc2145";
    } else {
        document.getElementsByClassName("viewers-icon")[0].style.background = "#292929";
        document.getElementsByName("stream-img").src = "img/offline.png";
    }
})

var emotes;
socket.on("emotes", e => {
    emotes = e;
})

function emoteHelp(el) {
    var emotesDiv = document.getElementById("emotes")
    var text = el.value.split(" ")
    text = text[text.length - 1]
    var possibleEmotes = []
    if (text[0] == ":") {
        // User is typing up an emote
        for (emote of emotes) {
            if (!emote.special) {
                if ((":" + emote.name + ":").indexOf(text) != -1) {
                    possibleEmotes.push(emote)
                }
            }
        }
    }

    var max = 20;
    if (possibleEmotes.length > 0) {
        emotesDiv.innerHTML = ""
        // Open
        var amount = possibleEmotes.length > max ? max : possibleEmotes.length
        var height = amount * 40
        emotesDiv.style.height = height + "px"
        for (var i = 0; i < amount; i++) {
            var emote = possibleEmotes[i]
            emotesDiv.innerHTML += `<div onclick="quickEmote(this)" emote-name="${emote.name}" class="emote-preview"><img class="emote-preview-img" src="emotes/${emote.src}"><span class="emote-name">:${emote.name}:</span></div>`
        }
    } else {
        // Close
        emotesDiv.style.height = "0px"
    }
}

function quickEmote(el) {
    var name = el.getAttribute("emote-name")
    for (emote of emotes) {
        if (emote.name == name) {
            var text = document.getElementsByClassName("chat-input")[0].value
            text = text.substr(0, text.lastIndexOf(" "))
            text += (text.length > 0 ? " " : "") + ":" + name + ":"
            document.getElementsByClassName("chat-input")[0].value = text
        }
    }
}

socket.on("chat", pack => {
    var message = sanitizeHTML(pack.message);
    /* var emotes = pack.emotes;
    for(var emote of emotes){
        while(message.indexOf(":" + emote + ":") != -1) message = message.replace(":" + emote + ":", "<img src='emotes/" + emote + ".png' class='emote'>")
    } */
    while (message.indexOf("EMOTE=") != -1) {
        var url = message.substr(message.indexOf("EMOTE=") + 6, 36)
        var index = message.indexOf("EMOTE=");
        message = message.split("")

        message.splice(index, 41)
        message[index] = `<img src="emotes/${url}" class="emote">` /* .splice(message.indexOf("EMOTE="), 42) */ /* .join("") */
        message = message.join("")
    }

    document.getElementsByClassName("messages")[0].innerHTML += '<div class="message"><span class="chat-content"><span class="chat-username">' + pack.username + ":</span> " + message + '</span></div>';
    document.getElementsByClassName("messages")[0].scrollTop = document.getElementsByClassName("messages")[0].scrollHeight;
})

document.getElementsByClassName("chat-input")[0].addEventListener("keydown", e => {
    if (e.key == "Enter") {
        socket.emit("chat", {
            stream: stream,
            message: e.srcElement.value,
            token: token
        })
        e.srcElement.value = "";
        document.getElementById("emotes").style.height = "0px"
    }
});

function sanitizeHTML(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};