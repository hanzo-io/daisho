{
  View
} = require('crowdcontrol').Views

m = require '../mediator'
refer = require 'referential'
Events = require '../events'

module.exports = class OrgSwitcherMenu extends View
  tag: 'org-switcher-menu'
  html: '''
  <yield if="{ data.get('options').length > 0 }"></yield>
  <daisho-menu-widget data="{ data }" if="{ data.get('options').length > 0 }"></daisho-menu-widget>
  '''

  dashboardData: null
  init: ()->
    @dashboardData = refer {} if !@dashboardData?
    @data = refer
      filter: ''
      options: []

    super

    @client.account.organization().then((res)=>
      for org, i in res.organizations
        do (i, org)=>
          @data.set 'options.' + i,
            name: org
            action: ()->
              m.trigger Events.SwitchOrg, org
      @update()
    ).catch (err)=>
      console.log err.message
      @update()


