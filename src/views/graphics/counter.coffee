CrowdControl    = require 'crowdcontrol'
Tween           = require 'tween.js'

module.exports = class Counter extends CrowdControl.Views.View
  tag: 'daisho-ui-counter'
  html: require '../../templates/graphics/counter'
  value0: 0
  value1: 0
  tween0: null
  tween1: null
  timer: 1000
  init: ()->
    super
    @on 'mount', ->
    @on 'update', =>
      data = @data
      self = @
      if !@tween0 && data.get '0'
        value0 = data.get(0 + '.ys.0')
        if value0 && value0 != @value0
          @tween0 = new Tween.Tween
            v: @value0
          .to { v: value0 }, @timer
          .onUpdate ->
            self.value0 = @v
            requestAnimationFrame ->
              self.update()
          .onComplete =>
            @tween0 = null
            @value0 = value0
            requestAnimationFrame =>
              @update()
          .start()

      if !@tween1 && data.get '1'
        value1 =  data.get(1 + '.ys.0')
        if value1 && value1 != @value1
          @tween1 = new Tween.Tween
            v: @value1
          .to { v: value1 }, @timer
          .onUpdate ->
            self.value1 = @v
            requestAnimationFrame ->
              self.update()
          .onComplete =>
            @tween1 = null
            @value1 = value1
            requestAnimationFrame =>
              @update()
          .start()

  getNumber: (index)->
    if index == 0
      if !@data.get(0 + '.fmt.y')
        return @value0
      return @data.get(0 + '.fmt.y') @value0
    else
      if !@data.get(1 + '.fmt.y')
        return @value1
      return @data.get(1 + '.fmt.y') @value1
