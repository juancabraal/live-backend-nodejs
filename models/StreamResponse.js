class Product {
  constructor(data) {
    const {
      id_product,
      id_button,
      reference,
      productName,
      price,
      listPrice,
      images = [],
      items = [],
      composition = [],
      guide = [],
      description = '',
    } = data;

    this.id_product = id_product;
    this.id_button = id_button;
    this.reference = reference;
    this.productName = productName;
    this.images = images;
    this.price = price;
    this.listPrice = listPrice;
    this.composition = composition;
    this.items = items;
    this.guide = guide;
    this.description = description;
  }
}

class Button {
  constructor(data) {
    const { id_button, id_stream, x, y, label, image, products = [] } = data;

    this.id_button = id_button;
    this.id_stream = id_stream;
    this.x = x;
    this.y = y;
    this.label = label;
    this.image = image;
    this.products = products.map((productData) => new Product(productData));
  }
}

module.exports = class StreamResponse {
  constructor(data) {
    const {
      id_stream,
      brand,
      is_live,
      stream_name,
      stream_url,
      buttons = [],
      analytics = '',
      backofficeStreamConfig = {},
    } = data;

    this.id_stream = id_stream;
    this.brand = brand;
    this.is_live = is_live;
    this.stream_name = stream_name;
    this.stream_url = stream_url;
    this.buttons = buttons.map((buttonData) => new Button(buttonData));
    this.analytics = analytics;
    this.backofficeStreamConfig = backofficeStreamConfig;
  }
};
