const { Model } = require( "objection");
const knex = require( "../database/KnexConnection");
const Buttons = require( "./Buttons");

class Streams extends Model {
    static get tableName() {
        return 'Streams';
    }
    static get idColumn() {
        return 'id_stream';
    }
    static get relationMappings() {
        return {
            buttons: {
                relation: Model.HasManyRelation,
                modelClass: Buttons,
                join: {
                    from: 'Streams.id_stream',
                    to: 'Buttons.id_stream'
                }
            }
        }
    }
}
Streams.knex(knex);

module.exports = Streams