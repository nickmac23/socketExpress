
exports.up = function(knex, Promise) {
  knex.schema.table('users', function(table){
    table.string('email').unique();
  })
};

exports.down = function(knex, Promise) {

};
