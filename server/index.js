const express = require("express");
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));
io.on('connection', socket => { 

    console.log("User has connected")
    
});


server.listen(80);