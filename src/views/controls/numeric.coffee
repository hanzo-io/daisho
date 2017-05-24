import { Text } from 'el-controls'
import util     from '../../util'

import html from '../../templates/controls/numeric'

class Numeric extends Text
  tag:  'numeric'
  html: html

  numericValue: ()->
    val = parseFloat @input.ref.get(@input.name)
    val = 0 if isNaN val

    return val

  getValue: ()->
    val = super
    val = parseFloat val
    val = 0 if isNaN val

    return val

export default Numeric

