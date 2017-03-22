import El from 'el.js'

import html from '../templates/list-item'

class List extends El.Views.Form
  tag:  'list-item'
  html: html
  init: -> super()

export default List
