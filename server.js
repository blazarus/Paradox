var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  fs = require("fs");

server.listen(8080);

app.use(express.static(__dirname + '/'));

app.use(express.favicon("./favicon.ico"));

app.get("*", function(req, res) {
  fs.createReadStream("./index.html").pipe(res);
});

var people = [];

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('join', function (data) {
    console.log(data);
    
  });
});