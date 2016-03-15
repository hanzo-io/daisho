if window?
  riot          = require 'riot'
  window.riot   = riot

  Views = require './views'

  window.Dashboard =
    Views: Views

  Views.register()

  Daisho.init '/example', '/example/fixtures/modules.json'
  .then () ->
    return Daisho.load ['home', 'user']
  .then (modules)->
    return riot.mount 'dashboard',
      modules: modules

  .then ()->
    # Daisho.route 'home'

