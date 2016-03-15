Promise         = require 'broken'
riot            = require 'riot'
window?.riot    = riot

exports =
  module: require './module'
  router: require './router'

window.Daisho = exports if window?

module.exports = exports
