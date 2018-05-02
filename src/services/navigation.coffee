# encode key value pairs
import utils from '../utils'

class NavService
  constructor: (@daisho, @debug)->

  replaceState: (id, opts)->
    url = utils.nav.encode id, opts

    history.replaceState JSON.stringify(
      id:   id
      opts: opts
    ), id, url

  pushState: (id, opts)->
    url = utils.nav.encode id, opts

    history.pushState JSON.stringify(
      id:   id
      opts: opts
    ), id, url

  getState: ()->
    json = null
    try
      json = JSON.parse history?.state
    catch e
      console.log '---NAV SERVICE---\ncould not parse history state'

    return json

  onPopState: (cb)->
    json = null
    window.onpopstate = (event)->
      try
        json = JSON.parse event.state
      catch e
        console.log '---NAV SERVICE---\ncould not parse history state'

      cb json

export default NavService

