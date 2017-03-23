import El from 'el.js'

import html from '../templates/list-item'

class List extends CrowdControl.Views.Form
  tag:  'daisho-list-item'
  html: html
  init: -> super()

export default List
