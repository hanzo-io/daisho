Promise     = require 'broken'
Xhr         = require 'xhr-promise-es6'
Xhr.Promise = Promise

require.urlFor = (file)->
  return '/example/fixtures/' + file

module.exports =
  # Master list of modules
  moduleDefinitions:    []

  # List of modules required by name
  modulesRequired:      []

  # Indexed map of modules required and loaded
  modules:              {}

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
    return new Promise (resolve, reject)=>
      timeoutId = setTimeout ()->
        reject(new Error "Loading Timed Out")
      , 10000

      waits = 0

      @modules = modules = {}
      for moduleRequired in @modulesRequired
        module = @_getModule moduleRequired

        waits++

        do (modules)->
          m = {}
          m.definition = module
          require module.name + '-v' + module.version + '/bundle.js', (js)->
            m.js = js
            waits--
            clearTimeout timeoutId

            modules[js.name] = js
            resolve(modules) if waits == 0

          m.css = module.name + '-v' + module.version + '/bundle.css'

      p.resolve(@modules) if waits == 0

  # _getModule takes
  _getModule: (moduleName)->
    for module in @moduleDefinitions
      if moduleName == module.name
        return module
