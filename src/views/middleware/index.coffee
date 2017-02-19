emailRe = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

middleware =
  isRequired: (value) ->
    return value if value && value != ''

    throw new Error 'Required'

  isEmail: (value) ->
    return value unless value

    return value.toLowerCase() if emailRe.test value

    throw new Error 'Enter a valid email'

  isPassword: (value) ->
    unless value
      throw new Error 'Required'

    return value if value.length >= 6

    throw new Error 'Password must be atleast 6 characters long'

module.exports = middleware
