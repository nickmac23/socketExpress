exports.up = function(knex, Promise) {
  return knex.schema.createTable('rooms', function( table ) {
    table.increments();
    table.string('name').notNullable();
    table.integer('usersId').references('users.id');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('rooms')
};
