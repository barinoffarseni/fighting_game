const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = []
let numberOfUsers = 0

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  const id = socket.handshake.issued
  console.log(id + ' user connected'); // оставь не трогай

  numberOfUsers += 1
  users.push({number: numberOfUsers, id: id}) 
  
  io.emit('set-id', id);
  
  console.log(users);
  io.emit('send-user-ids', users);

  // io.emit('event-name', 'Привет браузеру от сервера!');

  socket.on('disconnect', () => {
    for (number in users) {
      users.splice(users.indexOf(id), users.indexOf(id))
      console.log(id + ' user disconnected');// оставь не трогай
    }
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