console.log('hi');
var dog = 'dog';

  $('form').submit(function(){
    socket.emit(dog, { room: 1, message: $('#m').val()});
    $('#m').val('');
    return false;
  });
  socket.on(dog, function(msg){
    console.log(msg.room);
    console.log(msg.message);
    $('#messages').append($('<li>').text(msg));
  });
