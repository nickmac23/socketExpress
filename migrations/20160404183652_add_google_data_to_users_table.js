
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.string('google_id');
    table.string('image_url');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.dropColumn('google_id');
    table.dropColumn('image_url');
  })
};
