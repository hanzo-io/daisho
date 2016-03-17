Promise = require 'broken'
requestAnimationFrame = require 'raf'

emailRe = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

module.exports =
  isRequired: (value)->
    return value if value && value != ''

    throw new Error 'Required'

  isEmail: (value)->
    if !value
      return value

    return value.toLowerCase() if emailRe.test value

    throw new Error 'Enter a valid email'

  isPassword: (value)->
    if !value
      return new Error 'Required'

    return value if value.length >= 6

    throw new Error 'Password must be atleast 6 characters long.'

  matchesPassword: (value)->
    if !value
      return new Error 'Required'

    return value if value == @get 'user.password'

    throw new Error 'Passwords must match.'

  splitName: (value)->
    if !value
      return value

    i = value.indexOf ' '
    @set 'user.firstName', value.slice 0, i
    @set 'user.lastName', value.slice i+1
    return value

