const SHOPIFY = {
  domain: "****",
  byReferencePath: "/admin/api/2020-04/products.json",
  byProductNamePath: "/admin/api/2019-04/products.json",
  imgSrcReplace: [".jpg", "_400x.jpg"],
  limit: 200,
  maxImages: 3,
};

const VTEX = {
  brands: {
    farm: {
      accountName: "lojafarm",
      saleChannel: 6,
    },
    animale: {
      accountName: "lojaanimale",
      saleChannel: 1,
    },
    fabula: {
      accountName: "lojafabula",
      saleChannel: 1,
    },
    mariafilo: {
      accountName: "mariafilo",
      saleChannel: 1,
    },
    abrand: {
      accountName: "lojaabrand",
      saleChannel: 1,
    },
    crisbarros: {
      accountName: "lojacrisbarros",
      saleChannel: 1,
    },
    offpremium: {
      accountName: "lojaoffpremium",
      saleChannel: 1,
    },
    farmatacado: {
      accountName: "lojafarm",
      saleChannel: 6,
    },
    crisbarrosvip: {
      accountName: "lojacrisbarros",
      saleChannel: 1,
    },
    foxton: {
      accountName: "foxton",
      saleChannel: 1,
    },
  },
  domain: "****",
  common: {
    searchPath: "/api/catalog_system/pub/products/search",
    image: {
      width: 600,
      height: 772,
      maxImages: 3,
    },
    compositionKey: "Composição",
    guidesKey: "Tabela de Medidas",
  },

  // config da VTEX é todo gerado ao chamar a função abaixo usando a brand como parametro, ex: VTEX.config('farm')
  config: (brand) => {
    return {
      domain: VTEX.domain.replace(
        "BRAND_ACCOUNT_NAME",
        VTEX.brands[brand].accountName
      ),
      saleChannel: VTEX.brands[brand].saleChannel,
      ...VTEX.common,
    };
  },
};

const dynamodb_tablename = process.env.DYNAMODB_TABLENAME;
const dynamodb_backoffice_tablename = process.env.DYNAMODB_BACKOFFICE_TABLENAME;

module.exports = {
  SHOPIFY,
  VTEX,
  dynamodb_tablename,
  dynamodb_backoffice_tablename,
};
