const express = require('express');
const router = express.Router();
const streamService = require('../services/stream');
const auth = require('../services/authenticator');
const StreamResponse = require('../models/StreamResponse');
const axios = require('axios');
const backoffice = require('../services/backoffice');

router.get('/:streamName', async function (req, res, next) {
  try {
    const { streamName } = req.params;
    const { preview } = req.query;

    const response = await streamService.getStreamContent(streamName);

    if (/^\d+$/.test(response.stream_url)) {
      const url = `https://api.vimeo.com/me/videos/${response.stream_url}/m3u8_playback`;
      try {
        const result = await axios.get(url, {
          headers: { Authorization: 'Bearer 3b132d0d8870c56731bab720ff6d6044' },
        });
        response.stream_url = result.data.m3u8_playback_url;
      } catch (e) {
        response.message =
          'erro ao buscar URL da live, o evento está ativo como ao vivo mesmo?';
        response.stream_url = '000000';
      }
    }

    const projection = preview === undefined ? 'published' : 'preview';
    const backofficeStreamConfig = await backoffice
      .getStreamConfigFromDynamo({
        id: String(`${response.brand}-${streamName}`).toLowerCase(),
        projection,
      })
      .then((result) => result)
      .catch((e) => {
        console.error(e);
        return {};
      });

    res.json(new StreamResponse({ ...response, backofficeStreamConfig }));
  } catch (error) {
    const response = error.message ? { message: error.message } : error;
    res.status(error.status || 500).send(response);
  }
});

router.patch(
  '/:id',
  auth.checkToken,
  auth.validateToken,
  async function (req, res, next) {
    try {
      const response = await streamService.setStreamDetails(req.body);

      res.send(response);
    } catch (e) {
      console.log(e);
    }
  }
);
module.exports = router;
