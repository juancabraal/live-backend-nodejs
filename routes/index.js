const express = require("express");
const router = express.Router();
const streamRouter = require('./stream');
const authRouter = require('./auth');
const ecommerceRouter = require('./ecommerce');

router.use('/stream', streamRouter);
router.use('/auth', authRouter);
router.use('/ecommerce', ecommerceRouter);

module.exports = router;
