{
  Page
  Module
} = require '../../../src/sdk'

riot = require 'riot'

Grid = require './grid'
Grid.register()

class Widgets extends Page
  render: ()->
    grid = document.createElement 'GRID'
    @el.appendChild grid

    return riot.mount 'grid', {}

module.exports = class Home extends Module
  @name: 'Home'

  routes:
    '/': Widgets
