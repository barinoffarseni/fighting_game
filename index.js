const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const userIds = []

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  const id = socket.handshake.issued
  console.log(id + 'user connected'); // оставь не трогай

  userIds.push(id)

  console.log(userIds);
  io.emit('set-id', userIds[0]);

  io.emit('event-name', 'Привет браузеру от сервера!');

  socket.on('disconnect', () => {
    console.log(id + 'user disconnected');// оставь не трогай
  });

  socket.on('event-name', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('control', (data) => {
    console.log(data);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});