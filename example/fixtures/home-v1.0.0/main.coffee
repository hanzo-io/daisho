{
  Page
  Module
} = require '../../../src/sdk'

class Widgets extends Page

module.exports = class Home extends Module
  @name: 'Home'

  routes:
    '/': Widgets
