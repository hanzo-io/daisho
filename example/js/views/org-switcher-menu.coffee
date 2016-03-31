{
  View
} = require('crowdcontrol').Views

m = require '../mediator'
refer = require 'referential'
Events = require '../events'

module.exports = class OrgSwitcherMenu extends View
  tag: 'org-switcher-menu'
  html: '''
  <yield></yield>
  <daisho-menu-widget data="{ data }" }" filter-placeholder="Find an organization"></daisho-menu-widget>
  '''
  orgs: []
  dashboardData: null
  init: ->
    @dashboardData = refer {} if !@dashboardData?
    @data = refer
      filter: ''
      options: []

    super

    @client.account.organization().then((res)=>
      @orgs = res.organizations
      @update()
    ).catch (err)=>
      console.log err.message
      @update()

    @on 'update', =>
      @data.set 'options', []
      i = 0
      for org in @orgs
        if org != @dashboardData.get 'organization'
          do (i, org)=>
            @data.set 'options.' + i++,
              name: org
              action: ()->
                m.trigger Events.SwitchOrg, org

