import El from 'el.js'

import Events from '../events'
import m      from '../mediator'

import html from '../templates/main'

export default class Main extends El.Form
  tag: 'daisho-main'
  html: html

  configs:
    'activeOrg':    []
    'search':       []

  error: null
  orgs:  null
  lastRoot: null

  init: ->
    # use the parent data as data, this is special case
    @data = @parentData

    super()

    # should have logged in by now do grab the orgs and look up active org key
    @orgs = {}
    for i, org of @data.get 'orgs'
      @orgs[i] = org.fullName

    @client.setKey @data.get('orgs')[@data.get('activeOrg')]['live-secret-key']

    # when things are updated, update to latest page
    @on 'update', =>
      current = @services.page.current.root
      if current? && current != @lastRoot
        $el = $(current)
        $page = $(@root).find '#page'
        $page.children().detach()
        $page.append $el
        current.scheduleUpdate?()
        @lastRoot = current

    # if active org is updated, restart the app
    m.on Events.Change, (name, val)=>
      if name == 'activeOrg'
        @client.setKey @data.get('orgs')[val]['live-secret-key']
        requestAnimationFrame ->
          window.location.reload()

  logout: ->
    m.trigger Events.Logout, res
    window.location.reload()

  _submit: (event) ->
