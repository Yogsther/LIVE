const socket = io('http://localhost');


const HEADER_BUTTONS = [
    {
        title: "Download",
        link: "download"
    },{
        title: "Login",
        link: "account"
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

function generateStreamDOM(){

}

function redir(href = ""){
    window.location.href = href;
}
