document.getElementsByClassName("chat-container")[0].style.height = document.getElementById("stream-img").offsetHeight-4 + "px";

socket.emit("watch_stream", location.href.substr(location.href.indexOf("?")+1))

socket.on("stream", img => {
    document.getElementById("stream-img").src = img;
})

socket.on("stream_info", info => {
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