const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', () => {
  console.log('connected to Server ');
});

socket.addEventListener('message', (message) => {
  console.log('Just got thies: ', message, 'from the Server');
});

socket.addEventListener('close', () => {
  console.log('connected from Server');
});