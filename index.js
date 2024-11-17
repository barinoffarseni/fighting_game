const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = []

let changedType = false

let type = ''

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  const id = socket.handshake.issued
  console.log(id + ' user connected');

  if (users.length < 1) {
    type = 'player'
  } else {
    type = 'enemy'

    io.emit('everyone-came-in', true)
  }

  if (changedType) {
    type = changedType
    changedType = false
  }

  users.push({type: type, id: id})

  io.emit('set-data', {type: type, id: id});

  console.log(users);

  socket.on('disconnect', () => {
    const index = users.findIndex(user => user.id == id);

    changedType = users[index]['type']

    if (index > -1) {
      users.splice(index, 1);
    }

    console.log(id + ' user disconnected');
  });

  socket.on('event-name', (msg) => {
    console.log('message: ' + msg);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});