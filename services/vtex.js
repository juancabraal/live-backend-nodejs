const axios = require('axios');
const { VTEX } = require('../config');

const sortByImageLabel = (images, maxImages) => {
  const imagesWithLabel = images.filter((image) => {
    if (typeof image.imageLabel === 'string' && isNaN(+image.imageLabel)) {
      image.imageLabel = image.imageLabel.replace(/[^0-9]/g, '');
    }

    if (
      image.imageLabel &&
      image.imageLabel !== '10' &&
      !isNaN(+image.imageLabel)
    ) {
      return true;
    }
  });

  const labels = imagesWithLabel
    .map((image) => {
      return +image.imageLabel;
    })
    .sort((first, second) => first - second); // se negativo: ASC, se positivo: DESC

  const sortedImages = labels
    .slice(0, maxImages)
    .map((label) =>
      imagesWithLabel.find((image) => +image.imageLabel === label)
    );

  return sortedImages;
};

const getImages = (product, config) => {
  if (!product.items || product.items.length < 1) {
    return [];
  }

  const referenceItem = product.items[0];
  const allImages = [...referenceItem.images];
  const { width, height, maxImages } = config.image;

  const sortedImages = sortByImageLabel(allImages, maxImages);

  return sortedImages.map((image) =>
    image.imageUrl.replace(
      `/ids/${image.imageId}`,
      `/ids/${image.imageId}-${width}-${height}`
    )
  );
};

const formatProduct = (product, config) => {
  if (!product.items || !product.items.length) return {};

  const images = getImages(product, config);
  const formattedProduct = {
    reference: product.productId,
    productName: product.productName,
    images,
    items: [],
    composition: product[config.compositionKey] || [],
    guide: product[config.guidesKey]
      ? JSON.parse(product[config.guidesKey])
      : [],
  };

  product.items.forEach((item) => {
    const { itemId, Tamanho = [], sellers = [] } = item;
    const seller = sellers[0] || { commertialOffer: {} };
    const { commertialOffer } = seller;

    formattedProduct.items.push({
      sku: itemId,
      size: Tamanho[0] || '',
      availableQuantity: commertialOffer.AvailableQuantity || 0,
    });

    if (commertialOffer.Price) {
      formattedProduct.price = commertialOffer.Price;
      formattedProduct.listPrice = commertialOffer.ListPrice;
    }
  });

  return formattedProduct;
};

const getProductsByReferencefId = async (
  referenceIds,
  brand,
  getItemFromDynamo
) => {
  const config = VTEX.config(brand);

  return new Promise((resolve, reject) => {
    getItemFromDynamo(resolve, reject);
  })
    .then((streamData) => {
      const data = JSON.parse(streamData);
      console.log('vtex: item do dynamo');
      return data;
    })
    .catch(async (e) => {
      console.log('item do axios');
      try {
        const batchReferenceIds = [];
        for (
          batchStartIndex = 0;
          batchStartIndex <= referenceIds.length;
          batchStartIndex += 50
        ) {
          batchReferenceIds.push(
            referenceIds.slice(batchStartIndex, batchStartIndex + 50)
          );
        }
        const formattedProducts = [];
        for (const batchReferenceId of batchReferenceIds) {
          let searchParams = batchReferenceId.reduce(
            (params, referenceId) => params + `fq=productId:${referenceId}&`,
            '?'
          );
          searchParams += `sc=${config.saleChannel}`;
          const url = config.domain + config.searchPath + searchParams;
          await axios
            .get(url)
            .then((response) => {
              return response.data;
            })
            .then((products) => {
              products.forEach((product) =>
                formattedProducts.push(formatProduct(product, config))
              );
            });
        }
        return Promise.resolve(formattedProducts);
      } catch (e) {
        console.error('VTEX Error:', e);
        return Promise.reject({ status: 404, message: 'Products not found' });
      }
    });
};

const getProductsByName = (productName, brand) => {
  try {
    const config = VTEX.config(brand);
    const url =
      config.domain +
      config.searchPath +
      `/${productName}?sc=${config.saleChannel}`;
    const formattedProducts = [];

    return axios
      .get(url)
      .then((response) => response.data)
      .then((products) => {
        products.forEach((product) => {
          formattedProducts.push(formatProduct(product, config));
        });
        return formattedProducts.filter((product) => product.price); //remove products without quantity
      })
      .catch((error) => {
        console.log('VTEX error', error);
        return Promise.reject({ status: 404, message: 'Products not found' });
      });
  } catch (e) {
    console.error(e);
  }
};

module.exports = { getProductsByReferencefId, getProductsByName };
