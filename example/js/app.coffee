riot          = require 'riot'
window.riot   = riot

refer       = require 'referential'

m           = require './mediator'
Views       = require './views'
Controls    = require './controls'
Events      = require './events'

window.Dashboard =
  Views: Views

Views.register()
Controls.register()

{ Api }     = require 'hanzo.js'
blueprints  = require './blueprints'

client = new Api
  debug:     true
  endpoint: 'https://api-dot-hanzo-staging.appspot.com'

client.addBlueprints k,v for k,v of blueprints
data = refer
  key: ''

Daisho.init '/example', '/example/fixtures/modules.json'
.then ->
  p = new Promise (resolve, reject) ->
    riot.mount 'login',
      client:   client
      data:     data

    m.on Events.LoginSuccess, (res)->
      data.set 'key', res.access_token
      riot.update()
      resolve()

  return p
.then ->
  # Emulate how we would query the modules out of the org we logged into
  return Daisho.load [
    'home'
    'user'
  ]
.then (modules) ->

  riot.mount 'dashboard',
    modules: modules
    api:     client

.then ->
  Daisho.setRenderElement $('dashboard > section')[0]
  Daisho.route 'home'
