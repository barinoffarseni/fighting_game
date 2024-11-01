const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// let userIndificators = {

// }
// function getUserIndificators() {
//   while ()
// }
io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(socket.handshake.issued)

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