module.exports = class CommandService
  commands: null
  daisho: null

  constructor: (@daisho, @debug)->
    @commands = {}

  register: (command, hint, fn)->
    if @commands[command]
      console.log '---CMD SERVICE---\nCollision for ' + name

    @commands[command] =
      command: command
      hint: hint
      fn: fn

  find: (command)->
    found = []
    for cmd, opts of @commands
      if opts.command.indexOf(command)== 0
        found.push opts

    found.sort (a,b)->
      nameA = a.command.toLowerCase()
      nameB = b.command.toLowerCase()
      if (nameA < nameB)
        return -1
      if (nameA > nameB)
        return 1
      return 0

    return found

  execute: (command, args)->
    command = @commands[command]
    if !command
      console.log '---COMMAND SERVICE---\n' + id + ' not registered'
    command.fn.apply @, args
