import Tween   from 'es-tween'

import Dynamic from '../dynamic'
import html from '../../templates/graphics/counter'

# --Counter--
# A counter supports a model with 2 series.  It will display the first
# datapoint in each series and display a comparison in the two series case or
# just a single number
class Counter extends Dynamic
  tag:    'daisho-graphics-counter'
  html:   html
  value0: 0
  value1: 0
  tween0: null
  tween1: null
  timer:  1000

  init: -> super()

  _refresh: ->
    data = @data
    self = @
    if !@tween0 && data.get '0'
      value0 = data.get(0 + '.ys.0')
      if value0? && value0 != @value0
        @tween0 = new Tween.Tween
          v: @value0
        .to { v: value0 }, @timer
        .onUpdate ->
          self.value0 = @v
          #needs to be update since its already in a RAF
          self.update()
        .onComplete =>
          @tween0 = null
          @value0 = value0
          @scheduleUpdate()
        .start()

    if !@tween1 && data.get '1'
      value1 =  data.get(1 + '.ys.0')
      if value1? && value1 != @value1
        @tween1 = new Tween.Tween
          v: @value1
        .to { v: value1 }, @timer
        .onUpdate ->
          self.value1 = @v
          #needs to be update since its already in a RAF
          self.update()
        .onComplete =>
          @tween1 = null
          @value1 = value1
          @scheduleUpdate()
        .start()

  getNumber: (index) ->
    if index == 0
      return @value0 if !@data.get(0 + '.fmt.y')
      @data.get(0 + '.fmt.y') @value0
    else
      return @value1 if !@data.get(1 + '.fmt.y')
      @data.get(1 + '.fmt.y') @value1

export default Counter
