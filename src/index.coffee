import $ from 'jquery'
import 'selectize'

import Hanzo      from 'hanzo.js'
import blueprints from './blueprints'

import riot from 'riot'
import observable from 'riot-observable'

import {requestAnimationFrame} from 'esraf'

import CrowdControl from 'crowdcontrol'
import Tween        from 'tween.js'
import Views        from './views'
import Services     from './services'

import Events   from './events'
import mediator from './mediator'

import util from './util'

animate = (time) ->
  requestAnimationFrame animate
  Tween.update time

requestAnimationFrame animate

reservedTags = {}

# Monkey patch crowdcontrol so all registration can be validated
CrowdControl.Views.Form.register = CrowdControl.Views.View.register = ->
  if reservedTags[@tag]
    throw new Error "#{@tag} is reserved:", reservedTags[@tag]
  r = new @
  @tag = r.tag
  reservedTags[@tag] = @
  return r

Views.register()

export default class Daisho
  @CrowdControl: CrowdControl
  @Views:        Views
  @Graphics:     Views.Graphics
  @Services:     Services
  @Events:       Events
  @mediator:     mediator
  @Riot:         riot
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
      menu:     new Services.Menu    @, debug
      page:     new Services.Page    @, debug
      command:  new Services.Command @, debug

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
        new module @, @services.page, @services.menu, @services.command

    @services.menu.start()

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

    if !opts.mediator
      opts.mediator = Daisho.mediator

    if !opts.daisho
      opts.daisho = @

    if typeof tag == 'string'
      riot.mount tag, opts
    else if isHTML
      riot.mount tag, tagName, opts

  update: ->
    requestAnimationFrame ->
      riot.update.apply riot, arguments
