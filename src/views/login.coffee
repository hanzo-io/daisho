import El from 'el.js'

import Events from '../events'
import m      from '../mediator'
import {
  isRequired,
  isEmail,
  isPassword,
} from './middleware'

import html from '../templates/login'


class Login extends El.Form
  tag: 'daisho-login'
  html: html

  configs:
    'account.email':    [ isRequired, isEmail ]
    'account.password': [ isPassword ]

  error: null
  disabled: false

  init: ->
    if !@data.get 'account'
      @data.set 'account',
        email: ''
        password: ''

    super

  _submit: (event) ->
    opts =
      email:      @data.get 'account.email'
      password:   @data.get 'account.password'
      # client_id:  @data.get 'organization'
      # grant_type: 'password'

    @error = null

    m.trigger Events.Login
    @disabled = true
    @scheduleUpdate()

    @client.dashv2.login(opts).then (res) =>
      @disabled = false
      @data.set 'account.password', ''
      @data.set 'account', res.user
      @data.set 'orgs', res.organizations
      @data.set 'activeOrg', 0
      m.trigger Events.LoginSuccess, res
      @scheduleUpdate()
    .catch (err) =>
      @disabled = false
      @error    = err.message
      m.trigger Events.LoginFailed, err
      @scheduleUpdate()

export default Login
