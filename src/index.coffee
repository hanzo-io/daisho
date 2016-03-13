Promise         = require 'broken'
riot            = require 'riot'
window?.riot    = riot

dashboard = require './dashboard'
dashboard.register()

exports =
  module: require './module'


  start: ()->
    riot.mount 'dashboard',
      modules: exports.module.modules

window.Daisho = exports if window?

module.exports = exports
