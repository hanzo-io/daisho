import Switch from './switch'

import html from '../../templates/controls/checkbox'

export default class BetterCheckbox extends Switch
  tag: 'checkbox'
  html: html
  getValue: (event)->
    return event.target.checked

BetterCheckbox.register()

