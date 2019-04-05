const socket = io('http://' + location.hostname);
var loc = window.location.href;
var token = localStorage.getItem("token");
var me;

if(token){
    socket.emit("login", {token: token});
}

if(at("stream")){
    socket.emit("watch_stream", loc.substr(loc.indexOf("?")+1))
}

socket.on("stream", img => {
    document.getElementById("stream-img").src = img;
})

socket.on("stream_info", info => {
    document.getElementById("title-stream").innerText = info.title;
    document.getElementById("description-stream").innerText = info.description;
    document.getElementById("viewercount").innerText = info.viewers;
})


function login(){
    cred = getCred();
    socket.emit("login", cred);
}
function signup(){
    cred = getCred();
    socket.emit("signup", cred);
}

function getCred(){
    return {
        username: document.getElementById("username-input").value,
        password: document.getElementById("password-input").value
    }
}

const HEADER_BUTTONS = [
    {
        title: "Download",
        link: "download"
    },{
        title: "Login",
        link: "login"
    }
]

const HEADER_LINKS = document.getElementById("header-links");

function renderButtons(){
    HEADER_LINKS.innerHTML = ""; // Remove the links
    for(item of HEADER_BUTTONS){
        HEADER_LINKS.innerHTML += "<a href='" + item.link + "' " + (document.body.offsetWidth > 500 ? "style='margin-left:15px;'" : "") + " class='header-button'>" + item.title + "</a>"
    }
}

renderButtons();



function at(name) {
    if (name == "index" && loc == "") return true;
    if (loc.toLowerCase().indexOf(name.toLowerCase()) != -1) return true;
    return false;
}

document.addEventListener("keypress", e => {
    if(e.key == "Enter"){
        if(at("account")) login();
    }
})

socket.on("token", t => {
    token = t;
    localStorage.setItem("token", token);
    redir("home");
})

socket.on("logged_in", data => {
    me = data;
    document.getElementById("header-links").children[1].innerText = data.username
    document.getElementById("header-links").children[1].href = "me"

    if(at("me")){
        document.getElementById("title").value = me.title;
        document.getElementById("description").value = me.description;
        document.getElementById("username").innerText = me.username;
    }
})

function save(){
    socket.emit("update", {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        token: token
    })
}

function showKey(button){
    button.remove();
    document.getElementById("stream-key").innerText = me.stream_key
}

socket.on("err", err => {
    console.warn("Err: " + err);
    try{
        document.getElementById("error").innerText = err;
    } catch(e){}
})

function redir(href = ""){
    window.location.href = href;
}

function validate(el){
    el.value =  el.value.replace(/[\W]+/g,"");
}