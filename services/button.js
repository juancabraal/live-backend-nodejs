const connection = require('../database/connection');

class ButtonService {
    getButtonsByStreamId = async (streamId) => {
        try {
            const readyConnection = await connection;

            const buttonsResult = await readyConnection.query(`
                SELECT
                    *
                FROM
                    Buttons
                WHERE
                    id_stream = ${streamId}
            `);
            const buttonsData = buttonsResult[0];

            return buttonsData;
        } catch (e) {
            console.log(e);
        }
    };
}

module.exports = new ButtonService();
