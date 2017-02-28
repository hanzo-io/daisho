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
    # use the parent data as data, this is special case
    @data = @parentData

    super

    # should have logged in by now do grab the orgs and look up active org key
    @orgs = {}
    for i, org of @data.get 'orgs'
      @orgs[i] = org.fullName

    @client.setKey @data.get('orgs')[@data.get('activeOrg')]['live-secret-key']

    # when things are updated, update to latest page
    @on 'updated', =>
      current = @services.page.current
      if current?
        $el = $(current)
        $page = $(@root).find '#page'
        $page.children().detach()
        $page.append $el
        current?.update?()

    # if active org is updated, restart the app
    m.on Events.Change, (name, val)=>
      if name == 'activeOrg'
        @client.setKey @data.get('orgs')[val]['live-secret-key']
        window.location.reload()

  logout: ()->
    m.trigger Events.Logout, res
    window.location.reload()

  _submit: (event)->
