import http from 'http';
import WebSocket from 'ws';
import express, { json } from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'Anon';
  console.log('connected to Browser ✅');
  socket.on('close', () => console.log('Disconnected from Browser ❌'));
  socket.on('message', (msg) => {
    const messageString = msg.toString('utf8');
    const message = JSON.parse(messageString);
    switch (message.type) {
      case 'newMessage':
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case 'nickname':
        socket['nickname'] = message.payload;
    }
  });
});

server.listen(3000, handleListen);
