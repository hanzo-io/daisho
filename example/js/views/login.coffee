CrowdControl    = require 'crowdcontrol'
{
  isRequired,
  isEmail,
  isPassword,
} = require './middleware'
m = require '../mediator'
Events = require '../events'

module.exports = class LoginForm extends CrowdControl.Views.Form
  tag: 'login'
  html: require '../templates/login.html'

  client: null

  configs:
    'email':            [ isRequired, isEmail ]
    'password':         [ isPassword ]
    'organization':     [ isRequired ]

  errorMessage: null

  _submit: (event)->
    opts =
      username:     @data.get 'email'
      password:     @data.get 'password'
      client_id:    @data.get 'organization'
      grant_type:   'password'

    @errorMessage = null

    m.trigger Events.Login
    @client.oauth.auth(opts).then((res)=>
      m.trigger Events.LoginSuccess, res
      @update()
    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.LoginFailed, err
      @update()
