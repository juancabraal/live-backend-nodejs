const AWS = require('aws-sdk');
const { dynamodb_backoffice_tablename } = require('../config');

// Set the region
AWS.config.update({ region: 'us-east-1' });
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

class BackOffice {
  getStreamConfigFromDynamo = ({ id, projection }) => {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: dynamodb_backoffice_tablename,
        Key: {
          id: { S: id },
        },
        ProjectionExpression: projection,
      };

      ddb.getItem(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          if (data.Item) {
            const dynamoProjectionItem = data.Item[projection];
            if (!dynamoProjectionItem) {
              return reject(
                `Projection not found: ${projection} for table "${dynamodb_backoffice_tablename}" on id "${id}"`
              );
            }
            resolve({ content: dynamoProjectionItem.S, projection });
          } else {
            reject(
              '[item not found on backoffice dynamodb] ' +
                dynamodb_backoffice_tablename +
                ': ' +
                id
            );
          }
        }
      });
    });
  };
}

module.exports = new BackOffice();
