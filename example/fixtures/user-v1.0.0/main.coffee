{
  Page
  Module
} = require 'daisho-sdk'

module.exports = class User extends Module
  @name: 'User'

  routes:
    '/':        Page
    '/create':  Page
    '/edit':    Page
