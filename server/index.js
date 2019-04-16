const express = require("express");
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const pug = require('pug');
const fs = require("file-system");
const md5 = require("md5")
const escape = require("sqlstring").escape;

render();

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

// Connect to mysql
// Edit MySQL.json to change
const MYSQL_CONF = JSON.parse(fs.readFileSync("MySQL.json", "utf8"))
var mysql = require('mysql');
var connection = mysql.createConnection(
    MYSQL_CONF
);
connection.connect();
console.log("Connected to " + MYSQL_CONF.database + " database.")

function err(message, socket) {
    socket.emit("err", message);
}

class Stream {
    constructor(key, socket, user) {
        this.socket_id = socket.id;
        this.key = key;
        this.user = user;
        this.start_time = Date.now();
        this.chat = [];
        this.title = (user.title.trim().length > 0) ? user.title : "No title";
        this.description = (user.description.trim().length > 0) ? user.description : "This stream has no description.";
        this.last_frame = "";
        this.viewers = []
    }
}

var streams = {};

io.on('connection', socket => {

    socket.on("start_stream", key => {
        getUserFromKey(key, user => {
            if (streams[socket.id]) return;
            streams[socket.id] = new Stream(key, socket, user);
            socket.emit("stream_confirmed")
        })
    })

    socket.on("stream", img => {
        img = "data:image/jpg;base64, " + img;
        console.log("SoS: " + Math.round(img.length/100)/10 + "kb");
        if (streams[socket.id]) {
            var stream = streams[socket.id];
            for (viewer of stream.viewers) {
                io.to(viewer).emit("stream", img); // Send out stream images to viewers
            }
        }
    })

    socket.on("watch_stream", name => {
        var stream_info = false;
        for (stream in streams) {
            stream = streams[stream];
            if (stream.user.username.toLowerCase() == name.toLowerCase()) {
                // Found the stream
                if (stream.viewers.indexOf(socket.id) == -1) {
                    stream.viewers.push(socket.id); // New viewer
                    updateViewers(stream);
                }
                stream_info = {
                    title: stream.title,
                    description: stream.description,
                    viewers: stream.viewers.length,
                    live: true
                };
                socket.emit("stream_info", stream_info);
            }
        }

        if(!stream_info){
            getUserUnsafe(name, user => {
                stream_info = {
                    title: (user.title.trim().length > 0) ? user.title : "No title",
                    description: (user.description.trim().length > 0) ? user.description : "This stream has no description.",
                    live: false,
                    viewers: 0
                };
                socket.emit("stream_info", stream_info);
            });
        }
    })

    socket.on("disconnect", () => {
        // Remove viewers and streamers
        for (stream in streams) {
            if (streams[stream].socket_id == socket.id) {
                updateViewers(streams[stream], true);
                delete streams[stream]; // Delete instance of stream once a streamer disconnects
            }
            else {
                for (var i = 0; i < streams[stream].viewers.length; i++) {
                    if (streams[stream].viewers[i] == socket.id) {
                        streams[stream].viewers.splice(i, 1); // Remove viewer from viewer-list in stream
                        updateViewers(streams[stream]);
                    }
                }
            }
        }
    })

    socket.on("signup", cred => {
        if (cred.username && cred.password) {
            // Validate information
            var error = null;
            if (!cred.username.match("^[a-zA-Z0-9_]*$")) error = "Forbidden characters in username";
            if (cred.username.length > 12) error = "Username is too long (>12)"
            if (cred.username.length < 3) error = "Username is too short (<3)"
            if (cred.password.length > 1000) error = "Do you really need that long of a password?";
            if (cred.password.length < 3) error = "Password is too short (<3)"

            if (error === null) {
                connection.query("SELECT * FROM Users WHERE upper(username) = " + escape(cred.username.toUpperCase()), (error, results) => {
                    if (results.length == 0) {
                        // Create the user
                        // Generate stream key
                        var key = (cred.username + "_" + md5(Math.random() * 1000000000)).toUpperCase();
                        connection.query("INSERT INTO Users (username, password, last_online, title, description, total_stream_time, stream_key) VALUES (" + escape(cred.username) + ", '" + md5(cred.password) + "', '" + Math.round(Date.now() / 1000) + "', '', '', '0', '" + key + "')")

                        socket.emit("token", cred.username.toLowerCase() + "_" + md5(cred.password));
                    } else {
                        err("Username is taken", socket);
                    }
                })
            } else {
                err(error, socket);
                return;
            }
        }
    })


    socket.on("login", cred => {
        if ((cred.password == undefined || cred.username == undefined) && cred.token == undefined) {
            err("Bad cred", socket);
            return;
        }
        if (cred.token) {
            // Token login
            cred.username = cred.token.substr(0, cred.token.lastIndexOf("_"));
            cred.password = cred.token.substr(cred.token.lastIndexOf("_") + 1)
        } else {
            cred.password = md5(cred.password) // Encrypt password
        }

        connection.query('SELECT * FROM Users WHERE upper(username) = ' + escape(cred.username.toLowerCase()), function (error, results, fields) {
            if (error) throw error;
            if (results.length == 0) {
                err("User does not exist.", socket);
                return;
            }

            if (results[0]) {
                var user = results[0];
                if (user.password.toLowerCase() === cred.password.toLowerCase()) {
                    // Authentic login!
                    //console.log(user.username + " logged in!")
                    if (!cred.token) {
                        // Not automatic login
                        socket.emit("token", user.username.toLowerCase() + "_" + user.password);
                    } else {
                        socket.emit("logged_in", {
                            username: user.username,
                            title: user.title,
                            description: user.description,
                            stream_key: user.stream_key
                        })
                    }
                } else {
                    err("Wrong password", socket);
                    return;
                }
            }
        });

    })

    socket.on("update", data => {
        getUserSafe(data.token, user => {
            connection.query("UPDATE Users SET title = " + escape(data.title) + ", description = " + escape(data.description) + " WHERE upper(username) = " + escape(user.username).toUpperCase(), (error, results) => {})
        })
    })
    // END OF SOCKET
});

/**
 * Updates all the viewer of the stream with new information.
 * Mostly for updating viewer amount and live status. Not used for chat.
 * @param {*} stream Stream to update 
 * @param {boolean} end_of_stream If the stream has ended.
 */
function updateViewers(stream, end_of_stream){
    stream_info = {
        title: stream.title,
        description: stream.description,
        viewers: end_of_stream ? 0 : stream.viewers.length,
        live: end_of_stream ? false : stream.live
    };
    for(viewer of stream.viewers){
        io.to(viewer).emit("stream_info", stream_info)
    }
}

/**
 * Get user from database. It's safe since the correct token (password) is required.
 * @param {String} token Login token for the user you want (username_mp5(password))
 * @param {Function} _callback Callback function that holds user
 */
function getUserSafe(token, _callback) {
    var username = token.substr(0, token.lastIndexOf("_"));
    var password = token.substr(token.lastIndexOf("_") + 1);
    connection.query("SELECT * FROM Users WHERE upper(username) = " + escape(username.toUpperCase()), (error, results) => {
        if (results.length > 0) {
            if (results[0].password === password) {
                _callback(results[0]);
            }
        }
    })
}

/**
 * Get user from their stream key
 * @param {String} key Stream key of the user you want to get
 * @param {Function} _callback Callback functions
 */
function getUserFromKey(key, _callback) {
    connection.query("SELECT * FROM Users WHERE stream_key = " + escape(key), (error, results) => {
        if (results.length > 0) {
            _callback(results[0]);
        }
    })
}

/**
 * Get user from database, unsafe since no password for the user is required!
 * @param {String} username Username of account to retrive
 * @param {Function} _callback Callback function
 */
function getUserUnsafe(username, _callback){
    connection.query("SELECT * FROM Users WHERE upper(username) = " + escape(username.toUpperCase()), (error, results) => {
        if (results) {
            _callback(results[0]);
        }
    })
}

// Renderes pug files on save
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