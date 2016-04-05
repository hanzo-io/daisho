{
  View
} = require('crowdcontrol').Views
$ = require 'jquery'
Packery = require 'packery'

module.exports = class Grid extends View
  tag: 'grid'
  html: require './templates/grid.html'

  route: ()->

  init: ()->

    @on 'updated', ()->
      $grid = $(@root).find('.grid')
      grid = $grid[0]

      unless grid.packery
        p = new Packery grid,
          itemSelector: '.grid-item'
          gutter: 0
          columnWidth: 360

        $grid[0].packery = p

      # make all grid-items draggable
      $grid.find('.grid-item').each (i, gridItem )->
        if gridItem.draggie?
          return

        draggie = new Draggabilly gridItem
        gridItem.draggie = draggie

        # bind drag events to Packery
        if grid.packery?
          grid.packery.bindDraggabillyEvents draggie


