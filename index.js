const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = []

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  const id = socket.handshake.issued
  console.log(id + ' user connected'); // оставь не трогай

  users.push(id) 
  
  io.emit('set-id', id);
  
  console.log(users);
  io.emit('send-user-ids', users);

  socket.on('send-status', (playerId) => {
    console.log('Получены данные от вкладки:', playerId);

    // Отправляем данные всем остальным вкладкам, кроме отправителя
    socket.broadcast.emit('get-status', playerId);
  });

  socket.on('send-status', (enemyId) => {
    console.log('Получены данные от вкладки:', enemyId);

    // Отправляем данные всем остальным вкладкам, кроме отправителя
    socket.broadcast.emit('get-status', enemyId);
  });

  // io.emit('event-name', 'Привет браузеру от сервера!');

  socket.on('disconnect', () => {

    console.log("dddaddadadaadadddddddddddddddd")
    console.log(users)
    const index = users.indexOf(id);
    console.log(index)
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