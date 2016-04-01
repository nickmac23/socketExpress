var express = require('express');
var router = express.Router();
var io = require('../lib/io')
const knex = require('../db/knexs');
const Rooms = function() { return knex('rooms') };

router.get('/', function (req, res, next) {
  Rooms().then(function(rooms){

      rooms.map(function(room){
        if(room.usersId === res.user.id){
          return room.canDelete = true;
        }
        return room;
      })
      res.render('rooms/list', {rooms: rooms})
  })
})

router.post('/', function(req, res, next) {
  req.body.room = req.body.room.toLowerCase();
  Rooms().where({name: req.body.room}).first().then(function(room){
    if (!room) {
      Rooms().insert({name: req.body.room, usersId: res.user.id}).then( function (){
        res.redirect('/rooms/' + req.body.room)
      })
    } else {
      res.redirect( '/rooms/' + req.body.room )
    }
  })
})


router.post('/:roomName/delete', function (req, res, next) {
  Rooms().where({name: req.params.roomName}).first().then(function(room){
    if(room.usersId === res.user.id){
      Rooms().where({name: req.params.roomName}).first().del().then( function () {
        res.redirect('/rooms')
      })
    }else{
      res.redirect('/rooms')
    }
  })
})

router.get('/:roomName', function (req, res, next) {
  Rooms().where({name: req.params.roomName}).first().then(function(room){
    res.render('rooms/show', {roomName: req.params.roomName, roomID: room.id})

  })
})

module.exports = router;
