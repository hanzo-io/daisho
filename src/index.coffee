window.$ = require 'jquery'
require 'selectize'

# patch raf
window.requestAnimationFrame = require 'raf'

CrowdControl = require 'crowdcontrol'

reservedTags = {}

# Monkey patch crowdcontrol so all registration can be validated
CrowdControl.Views.View.register = ()->
  if reservedTags[@tag]
    throw new Error "#{@tag} is reserved:", reservedTags[@tag]
  r = new @
  reservedTags[@tag] = @
  return r

Views = require './views'
Views.register()
