const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const users = {
  user1: {
      indificator: 0
  },
  user2: {
      indificator: 0
  }
}
const userIndificators = []

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// function getUserIndificators() {
//   while ()
// }
io.on('connection', (socket) => {
  userIndificators.push(socket.handshake.issued)
  console.log(userIndificators);
  io.emit('id', userIndificators[0]);

  io.emit('event-name', 'Привет браузеру от сервера!');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('event-name', (msg) => {
    console.log('message: ' + msg);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});