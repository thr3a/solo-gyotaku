'use strict'
const Capture = require('../../lib/capture')

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const cap = new Capture(request.query)
    try {
      await cap.openBrowser()
      await cap.goto()
      const pdfBuffer = await cap.save()
      const response = await cap.response()
      await cap.close()
      reply
        .type('application/pdf')
        .headers({
          'Content-Disposition': 'inline',
          'X-Cap-Url': encodeURIComponent(response.url),
          'X-Cap-Title': encodeURIComponent(response.title)
        })
        .send(pdfBuffer)
    } catch (error) {
      await cap.close()
      throw {
        statusCode: 500,
        message: error.message,
        backtrace: error.stack.split('\n')
      }
    }
  })
}
