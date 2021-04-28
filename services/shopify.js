const { SHOPIFY } = require('../config');
const cheerio = require('cheerio');
const axios = require('axios');

const formatImages = (images = []) => {
  return images
    .map((image) => (image ? image.src.replace(...SHOPIFY.imgSrcReplace) : ''))
    .slice(0, SHOPIFY.maxImages);
};
const getDetails = (html) => {
  const dataFields = {
    description: '',
    composition: [],
  };
  if (html) {
    // pegar as tags p e h3 via cheerio
    const allDetails = cheerio.load(html)('h3, p');

    allDetails.each((i, item) => {
      if (i === 0) {
        // a primeira tag p é sempre a descrição
        dataFields.description = item.children[0].data || '';
      }
      if (
        item.name === 'h3' &&
        item.children[0].data.includes('Composition') // verifica se existe o título da composicao
      ) {
        // adiciona a próxima tag p como composição
        dataFields.composition = [allDetails[i + 1].children[0].data] || [];
      }
    });
  }
  return dataFields;
};

const formatProduct = (product) => {
  const details = getDetails(product.body_html);
  const formattedProduct = {
    reference: `${product.id}`,
    productName: product.title,
    items: [],
    images: formatImages(product.images),
    description: details.description,
    composition: details.composition,
  };

  const variants = product.variants || [];
  variants.forEach((variant) => {
    if (typeof variant === 'object') {
      formattedProduct.items.push({
        sku: variant.id,
        size: variant.option2,
        availableQuantity: variant.inventory_quantity,
      });

      if (parseFloat(variant.price) > 0) {
        formattedProduct.price = parseFloat(variant.price);
        formattedProduct.listPrice = parseFloat(
          variant.compare_at_price || variant.price
        );
      }
    }
  });
  return formattedProduct;
};
const getProductsByReferencefId = (referenceIds, getItemFromDynamo) => {
  try {
    const formattedProducts = [];
    const referenceIdsParams = referenceIds.reduce(
      (paramString, referenceId) => paramString + `${referenceId},`,
      ''
    );

    return new Promise((resolve, reject) => {
      getItemFromDynamo(resolve, reject);
    })
      .then((streamData) => {
        const data = JSON.parse(streamData);
        console.log('shopify: item do dynamo');
        return data;
      })
      .catch((e) => {
        console.log('item do axios');
        return axios
          .get(
            `${
              SHOPIFY.domain + SHOPIFY.byReferencePath
            }?ids=${referenceIdsParams}&limit=${SHOPIFY.limit}`
          )
          .then((response) => response.data.products)
          .then((products) => {
            products.forEach((product) => {
              if (product) {
                formattedProducts.push(formatProduct(product));
              }
            });
            return formattedProducts;
          })
          .catch((error) => {
            return error;
          });
      });
  } catch (e) {
    console.error(e);
  }
};

const getProductsByName = (productName) => {
  try {
    return axios
      .get(`${SHOPIFY.domain + SHOPIFY.byProductNamePath}?title=${productName}`)
      .then((response) => response.data.products)
      .then((products) => {
        products = products.filter((product) => product.image).slice(0, 10);
        let formattedProducts = products.map((product) => {
          return formatProduct(product);
        });
        formattedProducts = formattedProducts.filter(
          (product) => product.price
        ); //remove products without quantity

        return formattedProducts;
      })
      .catch((error) => console.log('error', error));
  } catch (e) {
    console.error(e);
  }
};

module.exports = { getProductsByReferencefId, getProductsByName };
