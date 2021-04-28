var express = require('express');
var router = express.Router();
const vtex = require('../services/vtex');
const shopify = require('../services/shopify');

router.get('/search/:searchText-:brand', function (req, res, next) {
    try {
        const { searchText, brand } = req.params;
        if (brand === 'farmUS') {
            shopify
                .getProductsByName(searchText)
                .then((response) => res.status(200).send(response))
                .catch((error) => res.status(500).send(error));
        } else {
            vtex.getProductsByName(searchText, brand)
                .then((response) => res.status(200).send(response))
                .catch((error) => res.status(500).send(error));
        }
    } catch (e) {
        console.error(e);
    }
});

module.exports = router;
