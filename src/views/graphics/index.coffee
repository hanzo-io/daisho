import Chart   from './chart'
import Counter from './counter'
import Model   from './model'

export default Graphics =
  Model:   Model
  Chart:   Chart
  Counter: Counter

  register: ->
    @Chart.register()
    @Counter.register()
