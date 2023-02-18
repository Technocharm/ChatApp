// Node server which will handle socket io connections
const express = require("express");
const serverless = require("serverless-http")
const path = require("path");
const app = express();
const router = express.Router();
const http = require('http').createServer(app);
// const io = require('socket.io')(8000,{
const io = require('socket.io')(http,{
    cors: {
      origin: "*",
      methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders:["secretHeader"],
      credentials: true
    }
})
const port = process.env.PORT || 8000;

const modal_path = path.join(__dirname,"/js")

console.log(path.join(__dirname,"/dist/index.html"))

app.use('/js',express.static(modal_path))

app.use(express.static(path.join(__dirname,"/public")))
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"/dist/index.html"));
});

const users = {};

io.on('connection', socket =>{
    // If any new user joins, let other users connected to the server know!
    socket.on('new-user-joined', name =>{ 
        console.log(name)
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    // If someone sends a message, broadcast it to other people
    socket.on('send', message =>{
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    });

    // If someone leaves the chat, let others know 
    socket.on('disconnect', message =>{
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });


})

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
// module.exports.handler = serverless(app)