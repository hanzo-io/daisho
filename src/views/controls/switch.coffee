import Checkbox from 'el-controls/src/controls/checkbox'

import html from '../../templates/controls/switch'

export default class Switch extends Checkbox
  tag: 'switch'
  html: html
  getValue: (event)->
    return event.target.checked

Switch.register()
