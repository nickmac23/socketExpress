
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function( table ) {
    table.increments();
    table.string('name');
    table.string('password');
    table.string('email');
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
