import El from 'el.js'

import html from '../templates/list'

class List extends El.Views.View
  tag:  'list'
  html: html
  init: -> super()

export default List
