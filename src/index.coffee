exports =
  module: require './module'

window.Daisho = exports if window?

module.exports = exports
