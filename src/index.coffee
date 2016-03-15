Promise         = require 'broken'
riot            = require 'riot'
window?.riot    = riot

m = require './mediator'

dashboard = require './dashboard'
dashboard.register()

exports =
  module: require './module'

  start: ()->
    riot.mount 'dashboard',
      modules: exports.module.modules

    return m

window.Daisho = exports if window?

module.exports = exports
