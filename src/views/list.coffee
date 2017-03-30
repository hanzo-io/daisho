import El from 'el.js'

import html from '../templates/list'

class List extends El.View
  tag:  'daisho-list'
  html: html
  init: -> super()

export default List
