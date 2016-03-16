{
  View
} = require('crowdcontrol').Views

module.exports = class Dashboard extends View
  tag: 'dashboard'
  html: require '../templates/dashboard.html'

  route: ()->
