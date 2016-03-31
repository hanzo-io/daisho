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

data = refer
  loggedIn:     false
  organization: null

Daisho.init '/example', '/example/fixtures/modules.json'
.then ->

  key= cookie.get 'key'
  if key
    data.set 'organization', cookie.get 'organization'
    data.set 'loggedIn', true
    return key

  p = new Promise (resolve, reject) ->
    riot.mount 'login',
      client:   client
      data:     data

    m.on Events.LoginSuccess, (res)->
      organization = data.get 'organization'
      expires = res.expires_in / 3600 / 24

      data.set 'loggedIn', true
      cookie.set 'key', res.access_token,
        expires: expires
      cookie.set organization + '-key', res.access_token,
        expires: expires

      cookie.set 'organization', organization,
        expires: expires

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
    organization:   data.get 'organization'
    client:         client
  }

.then (moduleData) ->
  riot.mount 'dashboard',
    data:       data
    modules:    moduleData.modules
    moduleList: moduleData.moduleList
    client:     client

    m.on Events.SwitchOrg, (org)->
      data.set 'organization', org
      cookie.set 'organization', org,
        expires: 7
      key = cookie.get org + '-key'
      if key
        cookie.set 'key', key
        client.setKey key
        Daisho.refresh()
      else
        data.set 'loggedIn', false

      riot.update()

.then ->
  Daisho.setRenderElement $('dashboard > main')[0]
  lastRoute = Daisho.lastRoute()
  if !lastRoute
    Daisho.route 'home'
  else
    Daisho.route lastRoute
