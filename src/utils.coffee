import moment    from 'moment-timezone'
import analytics from 'shop.js-util/src/analytics'

import {
  requiresPostalCode
  requiresState
} from 'shop.js-util/src/country'

import {
  luhnCheck
  cardFromNumber
  cardType
  restrictNumeric
} from 'shop.js-util/src/card'

import {
  isZeroDecimal
  isCrypto
  renderUpdatedUICurrency
  renderUICurrencyFromJSON
  renderJSONCurrencyFromUI
} from 'shop.js-util/src/currency'

import {
  rfc3339
  mmddyyyy
  yyyymmdd
  ddmmyyyy
  renderDate
  renderUIDate
  renderJSONDate
} from 'shop.js-util/src/dates'

import {
  getLanguage
} from 'shop.js-util/src/language'

import {
  renderCryptoQR
} from 'shop.js-util/src/qrcodes'

import {
  getQueries
  getReferrer
  getMCIds
} from 'shop.js-util/src/uri'

export default utils =
  analytics:    analytics

  country:
    requiresPostalCode: requiresPostalCode
    requiresState:      requiresState

  card:
    luhnCheck:          luhnCheck
    cardFromNumber:     cardFromNumber
    cardType:           cardType
    restrictNumeric:    restrictNumeric

  currency:
    isZeroDecimal:  isZeroDecimal
    isCrypto:       isCrypto

    renderUpdatedUICurrency:    renderUpdatedUICurrency
    renderUICurrencyFromJSON:   renderUICurrencyFromJSON
    renderJSONCurrencyFromUI:   renderJSONCurrencyFromUI

    renderCurrency: renderUICurrencyFromJSON

  date:
    rfc3339:    rfc3339
    mmddyyyy:   mmddyyyy
    yyyymmdd:   yyyymmdd
    ddmmyyyy:   ddmmyyyy

    renderDate:     renderDate
    renderUIDate:   renderUIDate
    renderJSONDate: renderJSONDate
    moment:         moment

  language:
    getLanguage: getLanguage

  qrcode:
    renderCryptoQR: renderCryptoQR

  uri:
    getQueries:     getQueries
    getReferrer:    getReferrer
    getMCIds:       getMCIds

# alias incase you don't remember
utils.time = utils.date

utils.nav =
  encode: (id, opts) ->
    str = '/' + id + '/'
    if !opts?
      return str

    if typeof opts == 'string'
      if opts != ''
        return str + opts + '/'

      return str

    for k, v in opts
      str += k + ':' + v + '/'

    return str

  decode: (str) ->
    opts = {}

    parts = str.split '/'
    id = parts.shift()

    for k, v in parts
      if v == ''
        continue

      vs = v.split ':'

      if vs.length == 1
        return [id, vs[0]]

      opts[k] = v

    return [id, opts]


