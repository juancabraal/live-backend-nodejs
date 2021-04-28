const { Model } = require( "objection");
const knex = require( "../database/KnexConnection");

class Products extends Model {
    static get tableName() {
        return 'Products';
    }
    static get idColumn() {
        return 'id_product';
    }
}
Products.knex(knex);

module.exports = Products