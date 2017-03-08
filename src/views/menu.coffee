import CrowdControl from 'crowdcontrol'

import html from '../templates/menu'

export default class Menu extends CrowdControl.Views.View
  tag: 'daisho-menu'
  html: html

  error: null

  init: ->
    super

  items:->
    items = []
    for k, v of @services.menu.menu
      items.push
        name: k
        onclick: v
    items
