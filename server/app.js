const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Timer = require('./timer.js').Timer;

const users = []
const gameObjects = [];
let gameTimer = null
const sockets = []
let tickTimer = setInterval(() => {
  if (gameTimer !== null) {
    sockets.forEach(socket => {
      socket.broadcast.emit('timer', { timeRemaining: gameTimer.timeRemaining, timeOut: gameTimer.timeOut });
    })
  }

  gameObjects.forEach(gameObject => {
    gameObject.update()
  })
}, 500)

let type = 'samurai'

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  sockets.push(socket)

  const id = socket.handshake.issued
  // console.log(id + ' user connected');

  if (users.length > 0) { // если users.length = 1
    type = 'ninja'
  }

  // заходит 3й игрок - его шлем нахуй и не подключаем
  if (users.length > 2) {
    return
  }

  users.push({ type: type, id: id })
  // console.log(users);

  io.emit('set-data', { type: type, id: id }, users);
  // в этом IF мы начинаем игру
  // socket.on('timer-start', () => {
  if (users.length == 2) {
    gameTimer = new Timer();
    gameObjects.push(gameTimer)
  }


  socket.on('disconnect', () => {
    const index = users.findIndex(user => user.id == id);

    if (index > -1) {
      users.splice(index, 1);
    }

    // console.log(id + ' user disconnected');
    // console.log(users);
  });


  socket.on('event-name', (msg) => {
    // console.log('message: ' + msg);
  });


  socket.on('key-down', (keyName) => {
    socket.broadcast.emit('key-down', keyName);
  });


  socket.on('key-up', (keyName) => {
    socket.broadcast.emit('key-up', keyName);
  });
});

server.listen(3000, () => {
  // console.log('listening on *:3000');
});