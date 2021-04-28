const { Model } = require('objection');
const knex = require('../database/KnexConnection');
const User = require('./User');

class Brand extends Model {
  static get tableName() {
    return 'Brands';
  }
  static get idColumn() {
    return 'id';
  }
  static relationMappings = {
    users: {
      relation: Model.ManyToManyRelation,
      modelClass: User,
      join: {
        from: 'Brands.id',
        through: {
          from: 'Users_Brands.brand_id',
          to: 'Users_Brands.user_id'
        },
        to: 'User_Somalive.id_user_somalive'
      },
    },
  }
}
Brand.knex(knex);

module.exports = Brand;
