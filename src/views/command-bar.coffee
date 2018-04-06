import { Text } from 'el-controls'
import Events from '../events'

regex = /(".*?"|[^"\s]+)+(?=\s*|\s*$)/g

import html from '../templates/command-bar'

class CommandBar extends Text
  tag:    'daisho-command-bar'
  html:   html
  lookup: 'search'

  init: ->
    super()

    @on 'mount', =>
      $(@root).find('input').on 'keydown', (e) =>
        @keydown.apply @, arguments

    @on 'update', ->
      # stuff

  keydown: (event) ->
    if event.which == 9
      cmd = @getValue event
      # commands start with '/'
      if cmd && cmd[0] == '/'
        # autoComplete
        found = @found()
        if found[0]?
          if cmd.indexOf(found[0].command) != 1
            $(@root).find('input').val '/' + found[0].command
            @change event
          return false
    else if event.which == 13
      @execute()
      return false

    @scheduleUpdate()

    return true

  pick: (command) ->
    =>
      $(@root).find('input').val '/' + command


  found: ->
    target = $(@root).find('input')[0]
    return [] if !target

    cmd = @getValue(target: target)
    # commands start with '/'
    if cmd && cmd[0] == '/'
      args = cmd.match(regex).map (str)->
        return str.trim()

      @services.command.find args[0].substr 1
    else
      []

  execute: ->
    $el = $(@root).find('input')
    target = $el[0]
    return false if !target

    cmd = @getValue(target: target)
    # commands start with '/'
    if cmd && cmd[0] == '/'
      args = cmd.match(regex).map (str)->
        return str.trim()

      $el.val ''
      @change(target: $el)

      try
        @services.command.execute args.shift().substr(1), args
        @mediator.trigger Events.ForceRefresh
      catch e
        console.log e

    true

export default CommandBar
