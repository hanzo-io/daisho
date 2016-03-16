{
  View
} = require('crowdcontrol').Views

Daisho = require '../../../src/index.coffee'

module.exports = class Dashboard extends View
  tag: 'dashboard'
  html: require '../templates/dashboard.html'

  route: (route)->
    return ()->
      Daisho.route route
