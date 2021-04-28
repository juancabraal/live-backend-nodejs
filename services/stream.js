const connection = require('../database/connection');
const vtex = require('./vtex');
const shopify = require('./shopify');
const productService = require('./product');
const buttonService = require('./button');
const Streams = require('../models/Streams');
const Brand = require('../models/Brand');
const AWS = require('aws-sdk');
const { dynamodb_tablename } = require('../config');
const zlib = require('zlib');

// Set the region
AWS.config.update({ region: 'us-east-1' });
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const getItemFromDynamo = (streamId) => {
  return (resolve, reject) => {
    var params = {
      TableName: dynamodb_tablename,
      Key: {
        stream: { S: streamId },
      },
      ProjectionExpression: 'content',
    };

    // Call DynamoDB to read the item from the table
    ddb.getItem(params, function (err, data) {
      if (err) {
        reject('Error', err);
      } else {
        if (data.Item) {
          const buffer = zlib.gunzipSync(data.Item.content.B);
          const jsonStr = buffer.toString();
          resolve(jsonStr);
        } else {
          reject('item not found on dynamodb');
        }
      }
    });
  };
};

class StreamService {
  getStreamById = async (streamId) => {
    try {
      const readyConnection = await connection;

      const streamResult = await readyConnection.query(`
                SELECT
                    *
                FROM
                    Streams
                WHERE
                    id_stream = ${streamId}
            `);
      const streamData = streamResult[0][0];

      return streamData;
    } catch (error) {
      console.error(error);
    }
  };
  getStreamByStreamName = async (streamName) => {
    try {
      const readyConnection = await connection;

      const streamResult = await readyConnection.query(`
                SELECT
                    *
                FROM
                    Streams
                WHERE
                    stream_name = '${streamName}'
            `);
      const streamData = streamResult[0][0];

      return streamData;
    } catch (error) {
      console.error(error);
    }
  };
  getBrandAnalytics = async (brandName) => {
    try {
      const brand = await Brand.query().findOne('name', brandName);
      return brand.analytics ? JSON.parse(brand.analytics) : '';
    } catch (error) {
      return Promise.reject(error);
    }
  };
  getStreamContent = async (streamName) => {
    try {
      const streamResult = await this.getStreamByStreamName(streamName);
      const streamIdentification = streamResult.brand + streamName;
      const buttonResult = await buttonService.getButtonsByStreamId(
        streamResult.id_stream
      );
      const productsResult = await productService.getProductsByButtonIds([
        ...new Set(buttonResult.map((button) => button.id_button)),
      ]);

      const getExternalProducts = () => {
        if (streamResult.brand === 'farmUS') {
          return shopify.getProductsByReferencefId(
            [...new Set(productsResult.map((product) => product.reference))],
            getItemFromDynamo(streamIdentification)
          );
        } else {
          return vtex.getProductsByReferencefId(
            [...new Set(productsResult.map((product) => product.reference))],
            streamResult.brand,
            getItemFromDynamo(streamIdentification)
          );
        }
      };

      const ecommerceProductsResult = await getExternalProducts();

      const analytics = await this.getBrandAnalytics(streamResult.brand);
      let result = {};
      result = { ...streamResult, analytics };
      result.buttons = [];
      buttonResult.forEach((button, index) => {
        result.buttons.push({
          ...button,
          products: productsResult
            .filter((product) => {
              return button.id_button === product.id_button;
            })
            .map((product) => {
              return {
                ...product,
                ...ecommerceProductsResult.find((ecommerceProduct) => {
                  return ecommerceProduct.reference === product.reference;
                }),
              };
            })
            .filter((product) => product.items),
        });
      });

      return result;
    } catch (error) {
      throw error;
    }
  };
  setStreamDetails = async (data) => {
    var mediaLive = new AWS.MediaLive();

    let channelName = 'prod3';

    switch (data.brand) {
      case 'farm':
      case 'farmUS': {
        channelName = 'prod1';
        break;
      }
      case 'animale': {
        channelName = 'prod2';
        break;
      }
      default:
        break;
    }

    var params = {
      ChannelId: channelName,
    };

    if (data.is_live) {
      mediaLive.startChannel(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
      });
    } else {
      mediaLive.stopChannel(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
      });
    }

    data.buttons = data.buttons.map((y) => {
      y.products = y.products.map((z) => ({
        id_product: z.id_product,
        reference: z.reference,
        id_button: z.id_button,
      }));
      return y;
    });
    return await Streams.query().upsertGraph(data).debug();
  };
}

module.exports = new StreamService();
