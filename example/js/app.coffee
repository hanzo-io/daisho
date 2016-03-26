window.riot = require 'riot'
DaishoRiot  = require 'daisho-riot'
refer       = require 'referential'

m           = require './mediator'

Views       = require './views'
Events      = require './events'
store       = require './utils/store'

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

d = store.get 'data'
if !d?
  data = refer
    key: ''
else
  data = refer d

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
      store.set 'data', data.get()

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
  Daisho.route 'home'
