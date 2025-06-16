const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = []

let type = 'samurai'

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  const id = socket.handshake.issued
  console.log(id + ' user connected');

  if (users.length > 0) {
    type = 'ninja'
  }

  users.push({type: type, id: id})

  io.emit('set-data', {type: type, id: id});

  console.log(users);

  socket.on('disconnect', () => {
    const index = users.findIndex(user => user.id == id);

    if (index > -1) {
      users.splice(index, 1);
    }

    console.log(id + ' user disconnected');
  });

  socket.on('event-name', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('key-down', (keyName) => {
    socket.broadcast.emit('key-down-two', keyName);
  });

  socket.on('key-up', (keyName) => {
    socket.broadcast.emit('key-up-two', keyName);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});