if window?
  riot          = require 'riot'
  window.riot   = riot

Api   = require 'hanzo.js'
Views = require './views'

blueprints = require './blueprints'

window.Dashboard =
  Views: Views

Views.register()

Daisho.init '/example', '/example/fixtures/modules.json'
.then ->
  return Daisho.load [
    'home'
    'user'
  ]
.then (modules) ->
  api = new Api
    debug:     true
    endpoint: 'https://api-dot-hanzo-staging.appspot.com'
    key:      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NTMyNTQ0MDAsImp0aSI6ImtnSTk4UFhYc2RBMEoiLCJGaXJzdE5hbWUiOiIiLCJMYXN0TmFtZSI6IiIsImFwcCI6IlN0b3JlIiwib3JnIjoic3VjaHRlZXMiLCJ0eXAiOiJhcGkiLCJ0c3QiOnRydWUsImJpdCI6MjR9.-kz2Y8MEm8cTHVWTtQP_YIqPUvdvmFy1W-zc3xJYY2s'

  api.addBlueprints k,v for k,v of blueprints

  riot.mount 'dashboard',
    modules: modules
    api:     api

.then ->
  Daisho.setRenderElement $('dashboard > section')[0]
  Daisho.route 'home'
