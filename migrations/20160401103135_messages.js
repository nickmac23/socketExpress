
exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', function( table ) {
    table.increments();
    table.text('message').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    table.integer('roomId').references('rooms.id');
    table.integer('usersId').references('users.id');
  })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('messages')
};
