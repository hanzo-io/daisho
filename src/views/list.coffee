import CrowdControl from 'crowdcontrol'

import html from '../templates/list'

class List extends CrowdControl.Views.View
  tag:  'list'
  html: html
  init: -> super()

export default List
