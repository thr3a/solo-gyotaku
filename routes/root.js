'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })

  fastify.get('/mysql', async (req, reply) => {
    const connection = await fastify.mysql.getConnection()
    const [rows, fields] = await connection.query(
      'SELECT * from posts', [req.params.id],
    )
    connection.release()
    return rows
  })

  fastify.get('/favicon.ico', async function (request, reply) {
    return ''
  })
}
