module.exports =
  Model: require './model'
  Counter: require './counter'

  register: ->
    @Counter.register()

