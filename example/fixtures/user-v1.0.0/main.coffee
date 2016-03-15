{
  Page
  Module
} = require '../../../src/sdk'

module.exports = class User extends Module
  @name: 'User'

  routes:
    '/':        null
    '/create':  null
    '/edit':    null
