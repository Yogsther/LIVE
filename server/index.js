const express = require("express");
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const pug = require('pug');
const fs = require("file-system");

render();
//app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    if (req.url.indexOf("?") !== -1) {
        req.url = req.url.split("?")[0];
    }
    if (req.path.indexOf('.') === -1) {
        req.url += '.html';
        next();
    } else
        next();
});

app.use(express.static(__dirname + '/public'));

app.get("*", function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', socket => {
    console.log("User has connected")
});


fs.watch("views", () => {
    render();
})

function render() {
    var files = fs.readdirSync("views");

    for (file of files) {
        try {
            var fn = pug.compileFile("views/" + file);
            var html = fn();
        } catch (e) {
            console.log(e)
            console.warn("Error!!")
        }
        fs.writeFileSync("public/" + file.substr(0, file.indexOf(".")) + ".html", html);
    }
}

server.listen(80);