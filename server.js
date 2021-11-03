const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let usersTyping;


app.use(express.static(__dirname + '/static'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

const colors = [ 'color_1', 'color_2', 'color_3', 'color_4'];
let usersCount = 0;
const usersMap = new Map(); 


io.on('connection', (socket) => {

    socket.on('disconnect', () => {
      const disconnectedUser = usersMap.get(socket.id);
      usersMap.delete(socket.id);

      let onlineUsers = [];
      usersMap.forEach(value => onlineUsers.push(value));
      io.emit('disconnection', disconnectedUser, onlineUsers);
      console.log(usersMap);
    });

    socket.on('new user', (user) => {
      usersCount += 1;
      user.userColor = colors[chooseColor(usersCount)];
      usersMap.set(socket.id, user); 

      let onlineUsers = [];
      usersMap.forEach(value => onlineUsers.push(value));
      io.emit('new user', user, onlineUsers);
    });
  
    socket.on('chat message', (msg) => {
      socket.broadcast.emit('chat message', msg, usersMap.get(socket.id)); 
    });

 
    socket.on('user typing', (username) => { 
      // todo: add support to multiple users typing
      console.log('user typing:' + username);
      
      io.emit('user typing', username);
    });

    socket.on('stop typing', (username) => {
      // 
      console.log('user stopped typing:' + username);
      io.emit('stop typing', username);
    });

});

function chooseColor (numUsers) {
  return numUsers >= 4 ? numUsers % 4 : numUsers;
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});
