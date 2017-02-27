CrowdControl    = require 'crowdcontrol'

module.exports = class Menu extends CrowdControl.Views.View
  tag: 'daisho-menu'
  html: require '../templates/menu'

  error: null

  init: ()->
    super

  items: ()->
    items = []
    for k, v of @services.menu.menu
      items.push
        name: k
        onclick: v
    return items

