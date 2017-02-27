CrowdControl = require 'crowdcontrol'

module.exports = class List extends CrowdControl.Views.View
  tag:  'list'
  html: require '../templates/list'
  init: ()->
    super
