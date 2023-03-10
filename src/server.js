import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anon';
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event:${event}`);
  });

  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    wsServer.sockets.emit('room_change', publicRooms());
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms());
  });

  socket.on('newMessage', (msg, room, done) => {
    socket.to(room).emit('newMessage', `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on('nickname', (nickname) => {
    socket['nickname'] = nickname;
  });
});

/* const sockets = [];
const wss = new WebSocket.Server({ server });
wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'Anon';
  console.log('connected to Browser ???');
  socket.on('close', () => console.log('Disconnected from Browser ???'));
  socket.on('message', (msg) => {
    const messageString = msg.toString('utf8');
    const message = JSON.parse(messageString);
    switch (message.type) {
      case 'newMessage':
        sockets.forEach((aSocket) =>
        aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
        break;
        case 'nickname':
          socket['nickname'] = message.payload;
          break;
        }
      });
    }); */

const handleListen = () => console.log('Listening on http://localhost:3000');
httpServer.listen(3000, handleListen);
