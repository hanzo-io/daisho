{
  View
} = require('crowdcontrol').Views

Daisho = require '../../../src/index.coffee'

module.exports = class Dashboard extends View
  tag: 'dashboard'
  html: require '../templates/dashboard.html'

  init: ()->
    super

    $(document).keyup (event)=>
      if event.keyCode == 27
        @resetMenus()

  route: (route)->
    return ()->
      Daisho.route route

  resetMenus: (event)->
    if event?
      $toggle = $('#' + event.target.htmlFor)
      value = $toggle.prop 'checked'

    $('dashboard header .menu-toggle').prop 'checked', false

    if event?
      $toggle.prop 'checked', !value

  ignore: (event)->
    event.stopPropagation()
    event.preventDefault()
    return false
