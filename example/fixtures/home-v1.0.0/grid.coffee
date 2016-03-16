{
  View
} = require('crowdcontrol').Views

module.exports = class Grid extends View
  tag: 'grid'
  html: require './templates/grid.html'

  route: ()->

  init: ()->

    @on 'updated', ()->
      $grid = $(@root).find('.grid')

      if !$grid[0].$grid?
        $grid.packery
          itemSelector: '.grid-item',
          gutter: 0,
          columnWidth: 360

        $grid[0].$grid = $grid

      # make all grid-items draggable
      $grid.find('.grid-item').each (i, gridItem )->
        if gridItem.draggie?
          return

        draggie = new Draggabilly gridItem
        gridItem.draggie = draggie

        # bind drag events to Packery
        $grid.packery 'bindDraggabillyEvents', draggie


