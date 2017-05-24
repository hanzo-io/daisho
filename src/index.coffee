import El    from 'el.js'
import Hanzo from 'hanzo.js'
import Tween from 'es-tween'
import {raf} from 'es-raf'

import Events     from './events'
import Services   from './services'
import Views      from './views'
import blueprints from './blueprints'
import mediator   from './mediator'
import util       from './util'

animate = (time) ->
  raf animate
  Tween.update time

raf animate

reservedTags = {}

# Monkey patch el.js so all registration can be validated
El.Views.Form.register = El.Views.View.register = ->
  if reservedTags[@tag]
    throw new Error "#{@tag} is reserved:", reservedTags[@tag]
  r = new @
  @tag = r.tag
  reservedTags[@tag] = @
  return r

Views.register()

export default class Daisho
  @El:           El
  @Views:        Views
  @Graphics:     Views.Graphics
  @Services:     Services
  @Events:       Events
  @mediator:     mediator
  @util:         util

  client:   null
  data:     null
  settings: null
  modules:  null
  debug:    false
  services: null
  util:     Daisho.util

  constructor: (url, modules, @data, @settings, debug = false) ->
    @client = new Hanzo.Api
      debug:    debug
      endpoint: url

    @debug = debug

    @services =
      menu:       new Services.Menu       @, debug
      page:       new Services.Page       @, debug
      command:    new Services.Command    @, debug
      navigation: new Services.Navigation @, debug

    @services.page.mount = =>
      @mount.apply @, arguments
    @services.page.update = =>
      @update.apply @, arguments

    @client.addBlueprints k,v for k,v of blueprints
    @modules = modules

  start: ->
    modules = @modules

    for k, module of modules
      if typeof module == 'string'
        # do something
      else
        new module @, @services.page, @services.menu, @services.command, @services.navigation

    @services.page.start()

  mount: (tag, opts = {}) ->
    isHTML = tag instanceof HTMLElement
    if isHTML
      tagName = tag.tagName.toLowerCase()
    else
      tagName = tag

    if !opts.client
      opts.client = @client

    if !opts.data
      if !@data.get tagName
        @data.set tagName, {}
      opts.data = @data.ref tagName

    if !opts.parentData
      opts.parentData = @data

    if !opts.services
      opts.settings = @settings

    if !opts.services
      opts.services = @services

    if !opts.util
      opts.util = @util

    if !opts.mediator
      opts.mediator = Daisho.mediator

    if !opts.daisho
      opts.daisho = @

    if typeof tag == 'string'
      El.mount tag, opts
    else if isHTML
      El.mount tag, tagName, opts

  scheduleUpdate: ->
    El.scheduleUpdate.apply El, arguments
