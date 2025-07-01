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

let type
let newType

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  sockets.push(socket)

  const id = socket.handshake.issued
  // console.log(id + ' user connected');

  if (users.length > 0) {
    type = 'ninja'
  } else {
    type = 'samurai'
  }

  if (newType) {
    type = newType
    newType = null
  }

  if (users.length > 2) {
    return
  }

  users.push({ type: type, id: id })

  io.emit('set-data', { type: type, id: id });
  if (users.length == 2) {
    gameTimer = new Timer();
    gameObjects.push(gameTimer)
  }

  socket.on('disconnect', () => {
    const index = users.findIndex(user => user.id == id);

    newType = users[index].type

    if (index > -1) {
      users.splice(index, 1);
    }
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