
exports.up = function(knex, Promise) {
  knex.schema.table('messages', function(table) {
    table.dropColumn('roomId');
    table.integer('roomId').references('rooms.id').onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {

};
