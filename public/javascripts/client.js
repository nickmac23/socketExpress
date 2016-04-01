console.log('hi');
var dog = 'dog';

  $('#msg').submit(function(){
    socket.emit(dog, { room: 1, message: $('#m').val()});
    $('#m').val('');
    return false;
  });
  socket.on(dog, function(msg){
    $('#messages').append($('<li>').text(msg.message));
  });
