const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = []

let type = ''

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  const id = socket.handshake.issued
  console.log(id + ' user connected'); // оставь не трогай

  console.log(users.length)
  if (users.length < 1) {
    type = 'player' 
  } else {
    type = 'enemy'
  }
  
  users.push({type: type, id: id})

  io.emit('set-id', id);
  io.emit('set-data', {type: type, id: id});

  console.log(users);
  // io.emit('send-user-ids', users);

  // io.emit('event-name', 'Привет браузеру от сервера!');

  socket.on('disconnect', () => {
    console.log("dddaddadadaadadddddddddddddddd")

    const index = users.indexOf(id);
    if (index > -1) { // only splice array when item is found
      users.splice(index, 1); // 2nd parameter means remove one item only
    }

    console.log(users)
    console.log(id + ' user disconnected');// оставь не трогай
  });

  socket.on('event-name', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('control', (key) => {
    io.emit('control2', {id: id, key: key});
    console.log(key);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});