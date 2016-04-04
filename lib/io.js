require('dotenv').load();
var cookieParser = require('socket.io-cookie-parser');
var knex = require('../db/knexs');
var Messages = function() { return knex('messages') };
var Rooms = function() { return knex('rooms') };
var Users = function() { return knex('users') };

var i = 0;
var roomUsers = {}
// see bin/www for where to attach this io instance to the app
var io = require('socket.io')();
io.roomUsers = roomUsers;
io.use(cookieParser(process.env.SECRET));
io.use(function authorization(socket, next) {
  socket.roomName = socket.request.signedCookies.roomName;
  Users().first().where({id: socket.request.signedCookies.userID})
         .then(function(user){
           socket.user = user;
           next();
         })
  // cookies are available in:
  // 1. socket.request.cookies
  // 2. socket.request.signedCookies (if using a secret)
});




// every time a socket connection is made, this function is called
io.on('connection', function (socket) {

  // whenever a client emits a message with the name `self`
  // this function will fire
  socket.on('self', function(msg) {
    console.log('user connected');
    // console.log(socket.user);
    // console.log(socket.roomName);
    // console.log(msg);
    knex('users').join('messages', 'users.id', 'messages.usersId')
                 .where({roomId: msg.roomID}).then(function(messages){
      io.sockets.connected[socket.id].emit('self', messages);
      room = roomUsers[socket.roomName];
      console.log("roomUsers: ", roomUsers,
                  "roomName: " + socket.roomName);
      if(!room) {
        roomUsers[socket.roomName] = {};
        room = roomUsers[socket.roomName];
        room.numPresent = 0;
        room.users = {}
      }
      room.numPresent++
      room.users[socket.user.id] = {name: socket.user.name,
                                    email: socket.user.email,
                                    id: socket.user.id};

      console.log(roomUsers);
      io.emit(socket.roomName, { messageType:"usersUpdate",
                                 currentState: roomUsers[socket.roomName]});
    })

  })

  // see this log in the server-side console
  // sockets have some noteworthy properties, such as `id` and `rooms`
  // console.log(socket);
  socket.on('dog', function(msg){
    msg.userName = socket.user.name;
    Messages().insert({usersId: socket.user.id, roomId: msg.roomID, message: msg.message})
      .then( function () {
        io.emit(socket.roomName, msg);
      })
    });


    socket.on('disconnect', function(){
      console.log(io.sockets.clients());
      if(roomUsers[socket.roomName]['users'][socket.user.id]){
        console.log('user disconnected');
        if(!roomUsers[socket.roomName]) return
        delete roomUsers[socket.roomName].users[socket.user.id];
        roomUsers[socket.roomName].numPresent--;
        io.emit(socket.roomName, { messageType:"usersUpdate",
        currentState: roomUsers[socket.roomName]});
      }
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
