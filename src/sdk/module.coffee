module.export = class Module
  # json of the module.json definition file
  json: null

  constructor: (@json)->

  # Load everything associated with this module
  load: ()->

  # Unload everything associated with this module
  unload: ()->

