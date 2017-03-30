import El from 'el.js'

import html from '../templates/menu'

export default class Menu extends El.View
  tag: 'daisho-menu'
  html: html

  error: null

  init: -> super()

  items:->
    return @services.menu.menu
