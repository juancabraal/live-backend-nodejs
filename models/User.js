const { Model } = require('objection');
const knex = require('../database/KnexConnection');

class User extends Model {
  static get tableName() {
    return 'User_Somalive';
  }
  static get idColumn() {
    return 'id_user_somalive';
  }

  static get relationMappings() {
    const Brand = require('./Brand');
    return {
      brands: {
        relation: Model.ManyToManyRelation,
        modelClass: Brand,
        join: {
          from: 'User_Somalive.id_user_somalive',
          through: {
            from: 'Users_Brands.user_id',
            to: 'Users_Brands.brand_id',
          },
          to: 'Brands.id',
        },
      },
    };
  }
}
User.knex(knex);

module.exports = User;
