import El from 'el.js'

import html from '../templates/list-item'

class List extends El.Form
  tag:  'daisho-list-item'
  html: html
  init: -> super()

export default List
