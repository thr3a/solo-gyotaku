'use strict'
const Capture = require('../../lib/capture');

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const cap = new Capture({
      url: 'https://turai.work'
    });
    await cap.openBrowser();
    await cap.goto();
    await cap.save();
    await cap.close();
    reply.send(await cap.response('ok'))
  })
}
