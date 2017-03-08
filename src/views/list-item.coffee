import CrowdControl from 'crowdcontrol'

import html from '../templates/list-item'

class List extends CrowdControl.Views.Form
  tag:  'list-item'
  html: html
  init: ->
    super

export default List
