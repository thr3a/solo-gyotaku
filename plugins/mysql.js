'use strict'

const fp = require('fastify-plugin')
const mysql = require('fastify-mysql')

module.exports = fp(async (fastify, opts) => {
  const mysqlOpts = Object.assign({}, {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || '3306',
    database: process.env.MYSQL_DATABASE || 'memo',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'pass',
    promise: true
  }, opts.mysql)

  fastify.register(mysql, mysqlOpts)
})
