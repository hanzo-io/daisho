CrowdControl    = require 'crowdcontrol'
$ = require 'jquery'

m = require '../mediator'
Events = require '../events'

module.exports = class Main extends CrowdControl.Views.Form
  tag: 'daisho-main'
  html: require '../templates/main'

  configs:
    'activeOrg': 0

  error: null
  orgs: null

  init: ()->
    super
    @orgs = {}
    for i, org of @data.get 'orgs'
      @orgs[i] = org.fullName

    @client.setKey @data.get('orgs')[@data.get('activeOrg')]['live-secret-key']

    @on 'updated', =>
      current = @services.page.current
      if current?
        $el = $(current)
        $root = $(@root)
        $root.html('').append $el
        current.update()

    m.on Events.Change, (name, val)=>
      if name == 'activeOrg'
        @client.setKey @data.get('orgs')[val]['live-secret-key']

  _submit: (event)->

