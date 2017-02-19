CrowdControl    = require 'crowdcontrol'

{
  isRequired,
  isEmail,
  isPassword,
} = require './middleware'

m = require '../mediator'
Events = require '../events'

module.exports = class Login extends CrowdControl.Views.Form
  tag: 'login'
  html: require '../templates/login'

  client: null

  configs:
    'email':            [ isRequired, isEmail ]
    'password':         [ isPassword ]

  error: null

  init: ()->
    super

  _submit: (event)->
    opts =
      username:     @data.get 'email'
      password:     @data.get 'password'
      # client_id:    @data.get 'organization'
      # grant_type:   'password'

    @error = null

    m.trigger Events.Login
    @client.dashv2.login(opts).then((res)=>
      m.trigger Events.LoginSuccess, res
      @data.set 'password', ''
      @update()
    ).catch (err)=>
      @error = err.message
      m.trigger Events.LoginFailed, err
      @update()
