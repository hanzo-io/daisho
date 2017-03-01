Text = require './controls/text'
Events = require '../events'

module.exports = class CommandBar extends Text
  tag: 'daisho-command-bar'
  html: require '../templates/command-bar'
  lookup: 'search'

  init: ->
    super

    @on 'mount', =>
      $(@root).find('input').on 'keydown', (e)=>
        @keydown.apply @, arguments

    @on 'update', ->
      # stuff

  keydown: (event)->
    if event.which == 9
      cmd = @getValue event
      # commands start with '/'
      if cmd && cmd[0] == '/'
        #autoComplete
        found = @found()
        if found[0]?
          if cmd.indexOf(found[0].command) != 1
            $(@root).find('input').val '/' + found[0].command
            @change event
          return false
    else if event.which == 13
      @execute()
      return false

    @update()

    return true

  pick: (command)->
    return ()=>
      $(@root).find('input').val '/' + command


  found: ()->
    cmd = @getValue(target:$(@root).find('input'))
    # commands start with '/'
    if cmd && cmd[0] == '/'
      args = cmd.split(' ').map (str)->
        return str.trim()

      return @services.command.find args[0].substr 1
    else
      return []

  execute: ()->
    $el = $(@root).find('input')
    cmd = @getValue(target: $el)
    # commands start with '/'
    if cmd && cmd[0] == '/'
      args = cmd.split(' ').map (str)->
        return str.trim()

      $el.val ''
      @change(target: $el)

      try
        @services.command.execute args.shift().substr(1), args
        @mediator.trigger Events.ForceRefresh
      catch e
        console.log e

    return true
