const connection = require('../database/connection');

class ProductsService {
  getProductsByButtonIds = async (buttonIds) => {
    try {
      if (!buttonIds.length) {
        return [];
      }
      const readyConnection = await connection;

      let query = `
                SELECT
                    *
                FROM
                    Products
                WHERE
            `;

      buttonIds.forEach((buttonId, index) => {
        query += `
                    id_button = ${buttonId}
                `;
        if (index !== buttonIds.length - 1) {
          query += ' OR ';
        }
      });

      const productsResult = await readyConnection.query(query);
      const productsData = productsResult[0];

      return productsData;
    } catch (e) {
      console.log(e);
    }
  };
}

module.exports = new ProductsService();
