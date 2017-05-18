import { Text } from 'el-controls'
import util     from '../../util'

import html from '../../templates/controls/currency'

class Currency extends Text
  tag:  'currency'
  html: html

  currencyValue: ()->
    return util.currency.decimalFromCents @data.get('currency'), @input.ref.get(@input.name)

  getValue: ()->
    val = super
    return util.currency.centsFromDecimal @data.get('currency'), val

export default Currency

