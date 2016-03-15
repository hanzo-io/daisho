module.exports =
  Dashboard: require './dashboard'

  register: ()->
    @Dashboard.register()
