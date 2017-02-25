module.exports =
  Model: require './model'
  Chart: require './chart'
  Counter: require './counter'

  register: ->
    @Chart.register()
    @Counter.register()

