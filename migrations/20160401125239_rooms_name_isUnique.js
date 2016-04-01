
exports.up = function(knex, Promise) {
  knex.schema.table('rooms', function(table){
    table.string('name').unique();
  })
};

exports.down = function(knex, Promise) {

};
