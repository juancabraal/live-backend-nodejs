const express = require('express');
const auth = require('../services/authenticator');
const { asyncHandler } = require('../helpers/webHelper');

let route = express.Router();

route.post('/login', async (req, res, next) => {
  if (!req.body.stream) return res.sendStatus(401);
  if (!req.body.password) return res.sendStatus(401);

  try {
    let token = await auth.loginAttempt({ stream, password, brand } = req.body);
    res.send(token);
  } catch (err) {
    res.sendStatus(err);
  }
});

route.post('/botaSenhaLa', async (req, res, next) => {
  if (!req.body.stream) return res.sendStatus(401);
  if (!req.body.password) return res.sendStatus(401);

  let attemptee = { stream: req.body.stream, password: req.body.password };

  try {
    let token = await auth.setPassword(attemptee);
    res.send(token);
  } catch (err) {
    res.sendStatus(err);
  }
});

route.get(
  '/checkToken',
  auth.checkToken,
  auth.validateToken,
  (req, res, next) => {
    res.json('Token OK');
  }
);

route.post(
  '/freeToken',
  asyncHandler(async (req, res, next) => {
    res.send(await auth.generateToken({ id: 0, login: 'su' }));
  })
);

module.exports = route;
