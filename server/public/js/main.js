const socket = io(location.protocol + "//" + location.hostname);
var token = localStorage.getItem("token");
var me;

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
renderButtons(); 


if(token){
    socket.emit("login", {token: token});
    updateHomeLink(token.substr(0, token.indexOf("_")))
}

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

function renderButtons(){
    HEADER_LINKS.innerHTML = ""; // Remove the links
    for(item of HEADER_BUTTONS){
        HEADER_LINKS.innerHTML += "<a href='" + item.link + "' " + (document.body.offsetWidth > 500 ? "style='margin-left:15px;'" : "") + " class='header-button'>" + item.title + "</a>"
    }
}

function at(name) {
    var path = location.pathname.substr(1);
    if (path == name) return true;
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

function updateHomeLink(username){
    document.getElementById("header-links").children[1].innerText = username
    document.getElementById("header-links").children[1].href = "me"
}

socket.on("logged_in", data => {
    me = data;
    updateHomeLink(data.username);

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
    if(me){
        button.remove();
        document.getElementById("stream-key").innerText = me.stream_key
    }
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