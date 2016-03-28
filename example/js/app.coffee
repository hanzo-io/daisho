window.riot = require 'riot'
DaishoRiot  = require 'daisho-riot'
refer       = require 'referential'

m           = require './mediator'

Views       = require './views'
Events      = require './events'
cookie      = require 'js-cookie'

window.Dashboard =
  Views: Views

Views.register()
DaishoRiot.register()

{ Api }     = require 'hanzo.js'
blueprints  = require './blueprints'

client = new Api
  debug:     true
  endpoint: 'https://api-dot-hanzo-staging.appspot.com'

client.addBlueprints k,v for k,v of blueprints

d = cookie.get 'data'
if !d?
  data = refer
    key: ''
else
  data = refer JSON.parse d

Daisho.init '/example', '/example/fixtures/modules.json'
.then ->

  key = data.get 'key'
  if key
    return key

  p = new Promise (resolve, reject) ->
    riot.mount 'login',
      client:   client
      data:     data

    m.on Events.LoginSuccess, (res)->
      data.set 'key', res.access_token
      cookie.set 'data', JSON.stringify(data.get()),
        expires: res.expires_in / 3600 / 24

      riot.update()
      resolve res.access_token

  return p

.then (key)->
  client.setKey key

  # Emulate how we would query the modules out of the org we logged into
  return Daisho.load [
    'home'
    'user'
  ],
  {
    client: client
  }

.then (data) ->
  riot.mount 'dashboard',
    modules:    data.modules
    moduleList: data.moduleList
    api:        client

.then ->
  Daisho.setRenderElement $('dashboard > main')[0]
  lastRoute = Daisho.lastRoute()
  if !lastRoute
    Daisho.route 'home'
  else
    Daisho.route lastRoute
