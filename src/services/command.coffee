class CommandService
  commands: null
  daisho:   null

  constructor: (@daisho, @debug) ->
    @commands = {}

  register: (command, hint, fn) ->
    if @commands[command]
      console.log '---CMD SERVICE---\nCollision for ' + name

    @commands[command] =
      command: command
      hint: hint
      fn: fn

  find: (command) ->
    found = []
    for cmd, opts of @commands
      if opts.command.indexOf(command)== 0
        found.push opts

    found.sort (a,b) ->
      nameA = a.command.toLowerCase()
      nameB = b.command.toLowerCase()
      if (nameA < nameB)
        return -1
      if (nameA > nameB)
        return 1
      return 0

    found

  execute: (command, args) ->
    for i, arg of args
      # strip quotes
      if arg[0] == '"'
        args[i]  = args[i].substr 1
      if arg.substr(-1) == '"'
        args[i]  = args[i].slice 0, -1
    cmd = @commands[command]
    if !cmd
      console.log '---COMMAND SERVICE---\n' + command + ' not registered'
    cmd.fn.apply @, args

export default CommandService
