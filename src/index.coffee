window?.$ = require 'jquery'
require 'selectize'

HanzoJS = require 'hanzo.js'
blueprints = require './blueprints'

window?.riot = require 'riot'
riot.observable = require 'riot-observable'

# patch raf
window.requestAnimationFrame = require 'raf'

CrowdControl = require 'crowdcontrol'

reservedTags = {}

# Monkey patch crowdcontrol so all registration can be validated
CrowdControl.Views.Form.register = CrowdControl.Views.View.register = ()->
  if reservedTags[@tag]
    throw new Error "#{@tag} is reserved:", reservedTags[@tag]
  r = new @
  @tag = r.tag
  reservedTags[@tag] = @
  return r

Views = require './views'
Views.register()
Services = require './services'

module.exports = class Daisho
  @CrowdControl:    CrowdControl
  @Views:           Views
  @Service:         Services
  @Events:          require './events'
  @Mediator:        require './mediator'
  @Riot: riot

  client: null
  data: null
  modules: null
  debug: false
  services: null

  constructor: (url, modules, @data, debug = false)->
    @client = new HanzoJS.Api
      debug:    debug
      endpoint: url

    @debug = debug

    @services =
      menu: new Services.Menu @
      page: new Services.Page @, @data, debug
    @services.page.mount = =>
      @mount.apply @, arguments
    @services.page.update = =>
      @update.apply @, arguments

    @client.addBlueprints k,v for k,v of blueprints
    @modules = modules

  start: ()->
    modules = @modules

    for k, module of modules
      if typeof module == 'string'
        # do something
      else
        new module @, @services.page, @services.menu

    @services.menu.start()

  mount: (tag, opts = {})->
    if !opts.client
      opts.client = @client

    if !opts.data
      opts.data = @data

    if !opts.services
      opts.services = @services

    if typeof tag == 'string'
      riot.mount tag, opts
    else if tag instanceof HTMLElement
      riot.mount tag, tag.tagName.toLowerCase(), opts

  update: ->
    requestAnimationFrame ()->
      riot.update.apply riot, arguments
