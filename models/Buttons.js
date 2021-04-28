const { Model } = require( "objection");
const knex = require( "../database/KnexConnection");
const Products = require( "./Products");

class Buttons extends Model {
    static get tableName() {
        return 'Buttons';
    }
    static get idColumn() {
        return 'id_button';
    }
    static get relationMappings() {
        return {
            products: {
                relation: Model.HasManyRelation,
                modelClass: Products,
                join: {
                    from: 'Buttons.id_button',
                    to: 'Products.id_button'
                }
            }
        }
    }
}
Buttons.knex(knex);

module.exports = Buttons