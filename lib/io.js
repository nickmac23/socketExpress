var knex = require('../db/knexs');
var Messages = function() { return knex('messages') };
var Rooms = function() { return knex('rooms') };
var Users = function() { return knex('users') };

// see bin/www for where to attach this io instance to the app
var io = require('socket.io')();
var i = 0;

// every time a socket connection is made, this function is called
io.on('connection', function (socket) {

  // whenever a client emits a message with the name `self`
  // this function will fire
  socket.on('self', function(message) {
    knex('users').join('messages', 'users.id', 'messages.usersId').where({roomId: message.roomID}).then(function(messages){
      io.sockets.connected[socket.id].emit('self', messages);
    })
  })

  // see this log in the server-side console
  // sockets have some noteworthy properties, such as `id` and `rooms`
  // console.log(socket);
    socket.on('dog', function(msg){
      console.log(msg);
      Messages().insert({usersId: msg.user, roomId: msg.roomID, message: msg.message})
        .then( function () {
          io.emit(msg.room, msg);
        })
      });
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });

  // whenever a client emits a message with the name `all`
  // this function will fire
  socket.on('all', function (data) {

    // io.sockets.emit sends a message to _all_ connected sockets
    // in all rooms
    io.sockets.emit('message', 'To everyone! (' + i + ')')
    i++;
  });

  // whenever a client emits a message with the name `broadcast`
  // this function will fire
  socket.on('broadcast', function (data) {

    // io.broadcast.emit sends a message to all connected sockets
    // _except_ for the current one
    socket.broadcast.emit('message', 'To everyone but me! (' + i + ')')
    i++;
  });

  // whenever a client emits a message with the name `join`
  // this function will fire
  socket.on('join', function (data) {

    // This is an example of how you can set properties on the socket object.
    // In this case, if a socket's already in a room, remove it.
    if (socket.room) {

      // This removes the current socket from the given room
      socket.leave(socket.room);
    }

    // This adds the current socket to the given room
    socket.join(data.showName);

    // This just sets an arbitrary property on the socket object
    // to store a quick reference to the room they joined
    //
    // NOTE: there are other ways to do this - this is just an example
    socket.room = data.showName;
  });

  // whenever a client emits a message with the name `message`
  // this function will fire
  socket.on('message', function (data) {

    // io.sockets.in sends a message to all sockets in this room
    // including the current socket
    io.sockets.in(socket.room).emit( 'message', 'To everyone in ' + socket.room + '! (' + i + ')' );
    i++;
  });

  // whenever a client emits a message with the name `broadcastMessage`
  // this function will fire
  socket.on('broadcastRoom', function (data) {

    // socket.broadcast.to sends a message to all sockets _in this room_
    // excluding the current socket
    socket.broadcast.to(socket.room).emit( 'message', 'To everyone in ' + socket.room + ' but origin! (' + i + ')' );
    i++;
  });
})

module.exports = io;
