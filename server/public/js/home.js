socket.emit("get_streams");

socket.on("streams", streams => {

    var indexDOM = streams.length > 0 ? "" : "<p>No one is LIVE right now.</p>";

    for(var stream of streams){
        indexDOM += `
        <a href="stream?${stream.username}">
            <div class="stream-block">
                <img class="img-preview" src="${stream.img}">
                <span class="preview-title"> ${stream.title} </span>
                <span class="preview-description"> ${stream.description} </span>
                <span class="preview-username">by ${stream.username} | ${stream.viewers} viewers</span>
            </div>
        </a>
        `
    }
    document.getElementsByClassName("index-page")[0].innerHTML = indexDOM;
})
