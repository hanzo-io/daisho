{
  Module
} = require 'daisho-sdk'

{ RiotPage } = require 'daisho-riot'

riot = require 'riot'

Grid = require './grid'
Grid.register()

class Widgets extends RiotPage
  tag: 'grid'

module.exports = class Home extends Module
  @name: 'Home'

  routes:
    '/': Widgets
