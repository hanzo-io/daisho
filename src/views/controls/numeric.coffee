import Text from 'el-controls/src/controls/text'

import html from '../../templates/controls/numeric'

class Numeric extends Text
  tag:  'numeric'
  html: html

  numericValue: ()->
    val = parseFloat @input.ref.get(@input.name)
    val = null if isNaN val

    return val

  getValue: ()->
    val = super
    val = parseFloat val
    val = null if isNaN val

    return val

export default Numeric

