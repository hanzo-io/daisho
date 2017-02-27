CrowdControl = require 'crowdcontrol'

module.exports = class List extends CrowdControl.Views.Form
  tag:  'list-item'
  html: require '../templates/list-item'
  init: ()->
    super
