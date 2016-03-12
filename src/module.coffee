Xhr         = require 'xhr-promise-es6'
Xhr.Promise = require 'broken'

require.urlFor = (file)->
  return '/example/fixtures/' + file

module.exports =
  # init takes the url of the modules.json and downloads it
  init: (@modulesUrl)->
    opts =
      url:      @modulesUrl
      method:   'GET'

    (new Xhr).send opts
      .then (res) =>
        @moduleDefinitions =  res.responseText

        return @moduleDefinitions
      .catch (res) ->
        console.log 'ERROR:', res

  # load takes an array of module names, looks them up in the saved module.json and requires them in
  load: (@modulesRequired)->
    waits = 0
    @modules = []
    for moduleRequired in @modulesRequired
      module = @_getModule moduleRequired

      m = {}

      waits++

      do (m)->
        m.definition = module
        require module.name + '-v' + module.version + '/bundle.js', (js)->
          m.js = js
          waits--

        m.css = module.name + '-v' + module.version + '/bundle.css'

      @modules.push m

  # _getModule takes
  _getModule: (moduleName)->
    for module in @moduleDefinitions
      if moduleName == module.name
        return module
