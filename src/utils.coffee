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

export default util =
  analytics:    analytics

  country:
    requiresPostalCode: requiresPostalCode
    requiresState:      requiresState

  card:
    luhnCheck:          luhnCheck
    cardFromNumber:     cardFromNumber
    cardType:           cardType
    restrictNumeric:    restrictNumeric

  time:
    rfc3339:    'YYYY-MM-DDTHH:mm:ssZ'
    yyyymmdd:   'YYYY-MM-DD'
    moment:     moment

  currency:
    isZeroDecimal:  isZeroDecimal
    isCrypto:       isCrypto

    renderUpdatedUICurrency:    renderUpdatedUICurrency
    renderUICurrencyFromJSON:   renderUICurrencyFromJSON
    renderJSONCurrencyFromUI:   renderJSONCurrencyFromUI

    renderCurrency: renderUpdatedUICurrency

  date:
    rfc3339:    rfc3339
    mmddyyyy:   mmddyyyy
    yyyymmdd:   yyyymmdd
    ddmmyyyy:   ddmmyyyy

    renderDate:     renderDate
    renderUIDate:   renderDate
    renderJSONDate: renderDate

  language:
    getLanguage: getLanguage

  qrcode:
    renderCryptoQR: renderCryptoQR

  uri:
    getQueries:     getQueries
    getReferrer:    getReferrer
    getMCIds:       getMCIds

