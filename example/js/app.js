(function (global) {
  var process = {
    title: 'browser',
    browser: true,
    env: {},
    argv: [],
    nextTick: function (fn) {
      setTimeout(fn, 0)
    },
    cwd: function () {
      return '/'
    },
    chdir: function () {
    }
  };
  // Require module
  function require(file, cb) {
    // Handle async require
    if (typeof cb == 'function') {
      return require.load(file, cb)
    }
    // Return module from cache
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var mod = {
      id: file,
      require: require,
      filename: file,
      exports: {},
      loaded: false,
      parent: null,
      children: []
    };
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = mod.exports;
    resolved.call(mod.exports, mod, mod.exports, dirname, file, process);
    mod.loaded = true;
    return require.cache[file] = mod.exports
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0
  };
  // define normal static module
  require.define = function (file, fn) {
    require.modules[file] = fn
  };
  require.waiting = {};
  // Determine base path for all modules
  var scripts = document.getElementsByTagName('script');
  var file = scripts[scripts.length - 1].src;
  require.basePath = file.slice(0, file.lastIndexOf('/') + 1);
  // Generate URL for module
  require.urlFor = function (file) {
    var url = file.replace(/^\.?\//, '');
    if (!/\.js$/.test(url))
      url = url + '.js';
    return require.basePath + url
  };
  // Load module async module
  require.load = function (file, cb) {
    // Immediately return previously loaded modules
    if (require.modules[file] != null)
      return cb(require(file));
    // Build URL to request module at
    var url = require.urlFor(file);
    var script = document.createElement('script'), scripts = document.getElementsByTagName('script')[0], callbacks = require.waiting[file] = require.waiting[file] || [];
    // We'll be called when async module is defined.
    callbacks.push(cb);
    // Load module
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    script.file = file;
    scripts.parentNode.insertBefore(script, scripts)
  };
  // Define async module
  require.async = function (file, fn) {
    require.modules[file] = fn;
    var cb;
    while (cb = require.waiting[file].shift())
      cb(require(file))
  };
  global.require = require;
  // source: node_modules/riot/riot.js
  require.define('riot/riot', function (module, exports, __dirname, __filename, process) {
    /* Riot v2.3.17, @license MIT */
    ;
    (function (window, undefined) {
      'use strict';
      var riot = {
          version: 'v2.3.17',
          settings: {}
        },
        // be aware, internal usage
        // ATTENTION: prefix the global dynamic variables with `__`
        // counter to give a unique id to all the Tag instances
        __uid = 0,
        // tags instances cache
        __virtualDom = [],
        // tags implementation cache
        __tagImpl = {},
        /**
   * Const
   */
        GLOBAL_MIXIN = '__global_mixin',
        // riot specific prefixes
        RIOT_PREFIX = 'riot-', RIOT_TAG = RIOT_PREFIX + 'tag', RIOT_TAG_IS = 'data-is',
        // for typeof == '' comparisons
        T_STRING = 'string', T_OBJECT = 'object', T_UNDEF = 'undefined', T_BOOL = 'boolean', T_FUNCTION = 'function',
        // special native tags that cannot be treated like the others
        SPECIAL_TAGS_REGEX = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/, RESERVED_WORDS_BLACKLIST = [
          '_item',
          '_id',
          '_parent',
          'update',
          'root',
          'mount',
          'unmount',
          'mixin',
          'isMounted',
          'isLoop',
          'tags',
          'parent',
          'opts',
          'trigger',
          'on',
          'off',
          'one'
        ],
        // version# for IE 8-11, 0 for others
        IE_VERSION = (window && window.document || {}).documentMode | 0;
      /* istanbul ignore next */
      riot.observable = function (el) {
        /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */
        el = el || {};
        /**
   * Private variables and methods
   */
        var callbacks = {}, slice = Array.prototype.slice, onEachEvent = function (e, fn) {
            e.replace(/\S+/g, fn)
          };
        // extend the object adding the observable methods
        Object.defineProperties(el, {
          /**
     * Listen to the given space separated list of `events` and execute the `callback` each time an event is triggered.
     * @param  { String } events - events ids
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
          on: {
            value: function (events, fn) {
              if (typeof fn != 'function')
                return el;
              onEachEvent(events, function (name, pos) {
                (callbacks[name] = callbacks[name] || []).push(fn);
                fn.typed = pos > 0
              });
              return el
            },
            enumerable: false,
            writable: false,
            configurable: false
          },
          /**
     * Removes the given space separated list of `events` listeners
     * @param   { String } events - events ids
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
          off: {
            value: function (events, fn) {
              if (events == '*' && !fn)
                callbacks = {};
              else {
                onEachEvent(events, function (name) {
                  if (fn) {
                    var arr = callbacks[name];
                    for (var i = 0, cb; cb = arr && arr[i]; ++i) {
                      if (cb == fn)
                        arr.splice(i--, 1)
                    }
                  } else
                    delete callbacks[name]
                })
              }
              return el
            },
            enumerable: false,
            writable: false,
            configurable: false
          },
          /**
     * Listen to the given space separated list of `events` and execute the `callback` at most once
     * @param   { String } events - events ids
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
          one: {
            value: function (events, fn) {
              function on() {
                el.off(events, on);
                fn.apply(el, arguments)
              }
              return el.on(events, on)
            },
            enumerable: false,
            writable: false,
            configurable: false
          },
          /**
     * Execute all callback functions that listen to the given space separated list of `events`
     * @param   { String } events - events ids
     * @returns { Object } el
     */
          trigger: {
            value: function (events) {
              // getting the arguments
              var arglen = arguments.length - 1, args = new Array(arglen), fns;
              for (var i = 0; i < arglen; i++) {
                args[i] = arguments[i + 1]  // skip first argument
              }
              onEachEvent(events, function (name) {
                fns = slice.call(callbacks[name] || [], 0);
                for (var i = 0, fn; fn = fns[i]; ++i) {
                  if (fn.busy)
                    return;
                  fn.busy = 1;
                  fn.apply(el, fn.typed ? [name].concat(args) : args);
                  if (fns[i] !== fn) {
                    i--
                  }
                  fn.busy = 0
                }
                if (callbacks['*'] && name != '*')
                  el.trigger.apply(el, [
                    '*',
                    name
                  ].concat(args))
              });
              return el
            },
            enumerable: false,
            writable: false,
            configurable: false
          }
        });
        return el
      }  /* istanbul ignore next */;
      (function (riot) {
        /**
 * Simple client-side router
 * @module riot-route
 */
        var RE_ORIGIN = /^.+?\/+[^\/]+/, EVENT_LISTENER = 'EventListener', REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER, ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER, HAS_ATTRIBUTE = 'hasAttribute', REPLACE = 'replace', POPSTATE = 'popstate', HASHCHANGE = 'hashchange', TRIGGER = 'trigger', MAX_EMIT_STACK_LEVEL = 3, win = typeof window != 'undefined' && window, doc = typeof document != 'undefined' && document, hist = win && history, loc = win && (hist.location || win.location),
          // see html5-history-api
          prot = Router.prototype,
          // to minify more
          clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click', started = false, central = riot.observable(), routeFound = false, debouncedEmit, base, current, parser, secondParser, emitStack = [], emitStackLevel = 0;
        /**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @returns {array} array
 */
        function DEFAULT_PARSER(path) {
          return path.split(/[\/?#]/)
        }
        /**
 * Default parser (second). You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @param {string} filter - filter string (normalized)
 * @returns {array} array
 */
        function DEFAULT_SECOND_PARSER(path, filter) {
          var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'), args = path.match(re);
          if (args)
            return args.slice(1)
        }
        /**
 * Simple/cheap debounce implementation
 * @param   {function} fn - callback
 * @param   {number} delay - delay in seconds
 * @returns {function} debounced function
 */
        function debounce(fn, delay) {
          var t;
          return function () {
            clearTimeout(t);
            t = setTimeout(fn, delay)
          }
        }
        /**
 * Set the window listeners to trigger the routes
 * @param {boolean} autoExec - see route.start
 */
        function start(autoExec) {
          debouncedEmit = debounce(emit, 1);
          win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit);
          win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
          doc[ADD_EVENT_LISTENER](clickEvent, click);
          if (autoExec)
            emit(true)
        }
        /**
 * Router class
 */
        function Router() {
          this.$ = [];
          riot.observable(this);
          // make it observable
          central.on('stop', this.s.bind(this));
          central.on('emit', this.e.bind(this))
        }
        function normalize(path) {
          return path[REPLACE](/^\/|\/$/, '')
        }
        function isString(str) {
          return typeof str == 'string'
        }
        /**
 * Get the part after domain name
 * @param {string} href - fullpath
 * @returns {string} path from root
 */
        function getPathFromRoot(href) {
          return (href || loc.href || '')[REPLACE](RE_ORIGIN, '')
        }
        /**
 * Get the part after base
 * @param {string} href - fullpath
 * @returns {string} path from base
 */
        function getPathFromBase(href) {
          return base[0] == '#' ? (href || loc.href || '').split(base)[1] || '' : getPathFromRoot(href)[REPLACE](base, '')
        }
        function emit(force) {
          // the stack is needed for redirections
          var isRoot = emitStackLevel == 0;
          if (MAX_EMIT_STACK_LEVEL <= emitStackLevel)
            return;
          emitStackLevel++;
          emitStack.push(function () {
            var path = getPathFromBase();
            if (force || path != current) {
              central[TRIGGER]('emit', path);
              current = path
            }
          });
          if (isRoot) {
            while (emitStack.length) {
              emitStack[0]();
              emitStack.shift()
            }
            emitStackLevel = 0
          }
        }
        function click(e) {
          if (e.which != 1  // not left click
|| e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented)
            return;
          var el = e.target;
          while (el && el.nodeName != 'A')
            el = el.parentNode;
          if (!el || el.nodeName != 'A'  // not A tag
|| el[HAS_ATTRIBUTE]('download')  // has download attr
|| !el[HAS_ATTRIBUTE]('href')  // has no href attr
|| el.target && el.target != '_self'  // another window or frame
|| el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1  // cross origin
)
            return;
          if (el.href != loc.href) {
            if (el.href.split('#')[0] == loc.href.split('#')[0]  // internal jump
|| base != '#' && getPathFromRoot(el.href).indexOf(base) !== 0  // outside of base
|| !go(getPathFromBase(el.href), el.title || doc.title)  // route not found
)
              return
          }
          e.preventDefault()
        }
        /**
 * Go to the path
 * @param {string} path - destination path
 * @param {string} title - page title
 * @param {boolean} shouldReplace - use replaceState or pushState
 * @returns {boolean} - route not found flag
 */
        function go(path, title, shouldReplace) {
          if (hist) {
            // if a browser
            path = base + normalize(path);
            title = title || doc.title;
            // browsers ignores the second parameter `title`
            shouldReplace ? hist.replaceState(null, title, path) : hist.pushState(null, title, path);
            // so we need to set it manually
            doc.title = title;
            routeFound = false;
            emit();
            return routeFound
          }
          // Server-side usage: directly execute handlers for the path
          return central[TRIGGER]('emit', getPathFromBase(path))
        }
        /**
 * Go to path or set action
 * a single string:                go there
 * two strings:                    go there with setting a title
 * two strings and boolean:        replace history with setting a title
 * a single function:              set an action on the default route
 * a string/RegExp and a function: set an action on the route
 * @param {(string|function)} first - path / action / filter
 * @param {(string|RegExp|function)} second - title / action
 * @param {boolean} third - replace flag
 */
        prot.m = function (first, second, third) {
          if (isString(first) && (!second || isString(second)))
            go(first, second, third || false);
          else if (second)
            this.r(first, second);
          else
            this.r('@', first)
        };
        /**
 * Stop routing
 */
        prot.s = function () {
          this.off('*');
          this.$ = []
        };
        /**
 * Emit
 * @param {string} path - path
 */
        prot.e = function (path) {
          this.$.concat('@').some(function (filter) {
            var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter));
            if (typeof args != 'undefined') {
              this[TRIGGER].apply(null, [filter].concat(args));
              return routeFound = true  // exit from loop
            }
          }, this)
        };
        /**
 * Register route
 * @param {string} filter - filter for matching to url
 * @param {function} action - action to register
 */
        prot.r = function (filter, action) {
          if (filter != '@') {
            filter = '/' + normalize(filter);
            this.$.push(filter)
          }
          this.on(filter, action)
        };
        var mainRouter = new Router;
        var route = mainRouter.m.bind(mainRouter);
        /**
 * Create a sub router
 * @returns {function} the method of a new Router object
 */
        route.create = function () {
          var newSubRouter = new Router;
          // stop only this sub-router
          newSubRouter.m.stop = newSubRouter.s.bind(newSubRouter);
          // return sub-router's main method
          return newSubRouter.m.bind(newSubRouter)
        };
        /**
 * Set the base of url
 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
 */
        route.base = function (arg) {
          base = arg || '#';
          current = getPathFromBase()  // recalculate current path
        };
        /** Exec routing right now **/
        route.exec = function () {
          emit(true)
        };
        /**
 * Replace the default router to yours
 * @param {function} fn - your parser function
 * @param {function} fn2 - your secondParser function
 */
        route.parser = function (fn, fn2) {
          if (!fn && !fn2) {
            // reset parser for testing...
            parser = DEFAULT_PARSER;
            secondParser = DEFAULT_SECOND_PARSER
          }
          if (fn)
            parser = fn;
          if (fn2)
            secondParser = fn2
        };
        /**
 * Helper function to get url query as an object
 * @returns {object} parsed query
 */
        route.query = function () {
          var q = {};
          var href = loc.href || current;
          href[REPLACE](/[?&](.+?)=([^&]*)/g, function (_, k, v) {
            q[k] = v
          });
          return q
        };
        /** Stop routing **/
        route.stop = function () {
          if (started) {
            if (win) {
              win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit);
              win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
              doc[REMOVE_EVENT_LISTENER](clickEvent, click)
            }
            central[TRIGGER]('stop');
            started = false
          }
        };
        /**
 * Start routing
 * @param {boolean} autoExec - automatically exec after starting if true
 */
        route.start = function (autoExec) {
          if (!started) {
            if (win) {
              if (document.readyState == 'complete')
                start(autoExec)  // the timeout is needed to solve
                                 // a weird safari bug https://github.com/riot/route/issues/33
;
              else
                win[ADD_EVENT_LISTENER]('load', function () {
                  setTimeout(function () {
                    start(autoExec)
                  }, 1)
                })
            }
            started = true
          }
        };
        /** Prepare the router **/
        route.base();
        route.parser();
        riot.route = route
      }(riot));
      /* istanbul ignore next */
      /**
 * The riot template engine
 * @version v2.3.21
 */
      /**
 * riot.util.brackets
 *
 * - `brackets    ` - Returns a string or regex based on its parameter
 * - `brackets.set` - Change the current riot brackets
 *
 * @module
 */
      var brackets = function (UNDEF) {
        var REGLOB = 'g', R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g, R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g, S_QBLOCKS = R_STRINGS.source + '|' + /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' + /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source, FINDBRACES = {
            '(': RegExp('([()])|' + S_QBLOCKS, REGLOB),
            '[': RegExp('([[\\]])|' + S_QBLOCKS, REGLOB),
            '{': RegExp('([{}])|' + S_QBLOCKS, REGLOB)
          }, DEFAULT = '{ }';
        var _pairs = [
          '{',
          '}',
          '{',
          '}',
          /{[^}]*}/,
          /\\([{}])/g,
          /\\({)|{/g,
          RegExp('\\\\(})|([[({])|(})|' + S_QBLOCKS, REGLOB),
          DEFAULT,
          /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/,
          /(^|[^\\]){=[\S\s]*?}/
        ];
        var cachedBrackets = UNDEF, _regex, _cache = [], _settings;
        function _loopback(re) {
          return re
        }
        function _rewrite(re, bp) {
          if (!bp)
            bp = _cache;
          return new RegExp(re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : '')
        }
        function _create(pair) {
          if (pair === DEFAULT)
            return _pairs;
          var arr = pair.split(' ');
          if (arr.length !== 2 || /[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)) {
            throw new Error('Unsupported brackets "' + pair + '"')
          }
          arr = arr.concat(pair.replace(/(?=[[\]()*+?.^$|])/g, '\\').split(' '));
          arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr);
          arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr);
          arr[6] = _rewrite(_pairs[6], arr);
          arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCKS, REGLOB);
          arr[8] = pair;
          return arr
        }
        function _brackets(reOrIdx) {
          return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx]
        }
        _brackets.split = function split(str, tmpl, _bp) {
          // istanbul ignore next: _bp is for the compiler
          if (!_bp)
            _bp = _cache;
          var parts = [], match, isexpr, start, pos, re = _bp[6];
          isexpr = start = re.lastIndex = 0;
          while (match = re.exec(str)) {
            pos = match.index;
            if (isexpr) {
              if (match[2]) {
                re.lastIndex = skipBraces(str, match[2], re.lastIndex);
                continue
              }
              if (!match[3])
                continue
            }
            if (!match[1]) {
              unescapeStr(str.slice(start, pos));
              start = re.lastIndex;
              re = _bp[6 + (isexpr ^= 1)];
              re.lastIndex = start
            }
          }
          if (str && start < str.length) {
            unescapeStr(str.slice(start))
          }
          return parts;
          function unescapeStr(s) {
            if (tmpl || isexpr)
              parts.push(s && s.replace(_bp[5], '$1'));
            else
              parts.push(s)
          }
          function skipBraces(s, ch, ix) {
            var match, recch = FINDBRACES[ch];
            recch.lastIndex = ix;
            ix = 1;
            while (match = recch.exec(s)) {
              if (match[1] && !(match[1] === ch ? ++ix : --ix))
                break
            }
            return ix ? s.length : recch.lastIndex
          }
        };
        _brackets.hasExpr = function hasExpr(str) {
          return _cache[4].test(str)
        };
        _brackets.loopKeys = function loopKeys(expr) {
          var m = expr.match(_cache[9]);
          return m ? {
            key: m[1],
            pos: m[2],
            val: _cache[0] + m[3].trim() + _cache[1]
          } : { val: expr.trim() }
        };
        _brackets.hasRaw = function (src) {
          return _cache[10].test(src)
        };
        _brackets.array = function array(pair) {
          return pair ? _create(pair) : _cache
        };
        function _reset(pair) {
          if ((pair || (pair = DEFAULT)) !== _cache[8]) {
            _cache = _create(pair);
            _regex = pair === DEFAULT ? _loopback : _rewrite;
            _cache[9] = _regex(_pairs[9]);
            _cache[10] = _regex(_pairs[10])
          }
          cachedBrackets = pair
        }
        function _setSettings(o) {
          var b;
          o = o || {};
          b = o.brackets;
          Object.defineProperty(o, 'brackets', {
            set: _reset,
            get: function () {
              return cachedBrackets
            },
            enumerable: true
          });
          _settings = o;
          _reset(b)
        }
        Object.defineProperty(_brackets, 'settings', {
          set: _setSettings,
          get: function () {
            return _settings
          }
        });
        /* istanbul ignore next: in the browser riot is always in the scope */
        _brackets.settings = typeof riot !== 'undefined' && riot.settings || {};
        _brackets.set = _reset;
        _brackets.R_STRINGS = R_STRINGS;
        _brackets.R_MLCOMMS = R_MLCOMMS;
        _brackets.S_QBLOCKS = S_QBLOCKS;
        return _brackets
      }();
      /**
 * @module tmpl
 *
 * tmpl          - Root function, returns the template value, render with data
 * tmpl.hasExpr  - Test the existence of a expression inside a string
 * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
 */
      var tmpl = function () {
        var _cache = {};
        function _tmpl(str, data) {
          if (!str)
            return str;
          return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
        }
        _tmpl.haveRaw = brackets.hasRaw;
        _tmpl.hasExpr = brackets.hasExpr;
        _tmpl.loopKeys = brackets.loopKeys;
        _tmpl.errorHandler = null;
        function _logErr(err, ctx) {
          if (_tmpl.errorHandler) {
            err.riotData = {
              tagName: ctx && ctx.root && ctx.root.tagName,
              _riot_id: ctx && ctx._riot_id
            };
            _tmpl.errorHandler(err)
          }
        }
        function _create(str) {
          var expr = _getTmpl(str);
          if (expr.slice(0, 11) !== 'try{return ')
            expr = 'return ' + expr;
          return new Function('E', expr + ';')
        }
        var RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'), RE_QBMARK = /\x01(\d+)~/g;
        function _getTmpl(str) {
          var qstr = [], expr, parts = brackets.split(str.replace(/\u2057/g, '"'), 1);
          if (parts.length > 2 || parts[0]) {
            var i, j, list = [];
            for (i = j = 0; i < parts.length; ++i) {
              expr = parts[i];
              if (expr && (expr = i & 1 ? _parseExpr(expr, 1, qstr) : '"' + expr.replace(/\\/g, '\\\\').replace(/\r\n?|\n/g, '\\n').replace(/"/g, '\\"') + '"'))
                list[j++] = expr
            }
            expr = j < 2 ? list[0] : '[' + list.join(',') + '].join("")'
          } else {
            expr = _parseExpr(parts[1], 0, qstr)
          }
          if (qstr[0])
            expr = expr.replace(RE_QBMARK, function (_, pos) {
              return qstr[pos].replace(/\r/g, '\\r').replace(/\n/g, '\\n')
            });
          return expr
        }
        var RE_BREND = {
            '(': /[()]/g,
            '[': /[[\]]/g,
            '{': /[{}]/g
          }, CS_IDENT = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\x01(\d+)~):/;
        function _parseExpr(expr, asText, qstr) {
          if (expr[0] === '=')
            expr = expr.slice(1);
          expr = expr.replace(RE_QBLOCK, function (s, div) {
            return s.length > 2 && !div ? '' + (qstr.push(s) - 1) + '~' : s
          }).replace(/\s+/g, ' ').trim().replace(/\ ?([[\({},?\.:])\ ?/g, '$1');
          if (expr) {
            var list = [], cnt = 0, match;
            while (expr && (match = expr.match(CS_IDENT)) && !match.index) {
              var key, jsb, re = /,|([[{(])|$/g;
              expr = RegExp.rightContext;
              key = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1];
              while (jsb = (match = re.exec(expr))[1])
                skipBraces(jsb, re);
              jsb = expr.slice(0, match.index);
              expr = RegExp.rightContext;
              list[cnt++] = _wrapExpr(jsb, 1, key)
            }
            expr = !cnt ? _wrapExpr(expr, asText) : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0]
          }
          return expr;
          function skipBraces(ch, re) {
            var mm, lv = 1, ir = RE_BREND[ch];
            ir.lastIndex = re.lastIndex;
            while (mm = ir.exec(expr)) {
              if (mm[0] === ch)
                ++lv;
              else if (!--lv)
                break
            }
            re.lastIndex = lv ? expr.length : ir.lastIndex
          }
        }
        // istanbul ignore next: not both
        var JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').', JS_VARNAME = /[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g, JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/;
        function _wrapExpr(expr, asText, key) {
          var tb;
          expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
            if (mvar) {
              pos = tb ? 0 : pos + match.length;
              if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
                match = p + '("' + mvar + JS_CONTEXT + mvar;
                if (pos)
                  tb = (s = s[pos]) === '.' || s === '(' || s === '['
              } else if (pos) {
                tb = !JS_NOPROPS.test(s.slice(pos))
              }
            }
            return match
          });
          if (tb) {
            expr = 'try{return ' + expr + '}catch(e){E(e,this)}'
          }
          if (key) {
            expr = (tb ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')') + '?"' + key + '":""'
          } else if (asText) {
            expr = 'function(v){' + (tb ? expr.replace('return ', 'v=') : 'v=(' + expr + ')') + ';return v||v===0?v:""}.call(this)'
          }
          return expr
        }
        // istanbul ignore next: compatibility fix for beta versions
        _tmpl.parse = function (s) {
          return s
        };
        _tmpl.version = brackets.version = 'v2.3.21';
        return _tmpl
      }();
      /*
  lib/browser/tag/mkdom.js

  Includes hacks needed for the Internet Explorer version 9 and below
  See: http://kangax.github.io/compat-table/es5/#ie8
       http://codeplanet.io/dropping-ie8/
*/
      var mkdom = function _mkdom() {
        var reHasYield = /<yield\b/i, reYieldAll = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/gi, reYieldSrc = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/gi, reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/gi;
        var rootEls = {
            tr: 'tbody',
            th: 'tr',
            td: 'tr',
            col: 'colgroup'
          }, tblTags = IE_VERSION && IE_VERSION < 10 ? SPECIAL_TAGS_REGEX : /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/;
        /**
   * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
   * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
   *
   * @param   {string} templ  - The template coming from the custom tag definition
   * @param   {string} [html] - HTML content that comes from the DOM element where you
   *           will mount the tag, mostly the original tag in the page
   * @returns {HTMLElement} DOM element with _templ_ merged through `YIELD` with the _html_.
   */
        function _mkdom(templ, html) {
          var match = templ && templ.match(/^\s*<([-\w]+)/), tagName = match && match[1].toLowerCase(), el = mkEl('div');
          // replace all the yield tags with the tag inner html
          templ = replaceYield(templ, html);
          /* istanbul ignore next */
          if (tblTags.test(tagName))
            el = specialTags(el, templ, tagName);
          else
            el.innerHTML = templ;
          el.stub = true;
          return el
        }
        /*
    Creates the root element for table or select child elements:
    tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
  */
        function specialTags(el, templ, tagName) {
          var select = tagName[0] === 'o', parent = select ? 'select>' : 'table>';
          // trim() is important here, this ensures we don't have artifacts,
          // so we can check if we have only one element inside the parent
          el.innerHTML = '<' + parent + templ.trim() + '</' + parent;
          parent = el.firstChild;
          // returns the immediate parent if tr/th/td/col is the only element, if not
          // returns the whole tree, as this can include additional elements
          if (select) {
            parent.selectedIndex = -1  // for IE9, compatible w/current riot behavior
          } else {
            // avoids insertion of cointainer inside container (ex: tbody inside tbody)
            var tname = rootEls[tagName];
            if (tname && parent.childElementCount === 1)
              parent = $(tname, parent)
          }
          return parent
        }
        /*
    Replace the yield tag from any tag template with the innerHTML of the
    original tag in the page
  */
        function replaceYield(templ, html) {
          // do nothing if no yield
          if (!reHasYield.test(templ))
            return templ;
          // be careful with #1343 - string on the source having `$1`
          var src = {};
          html = html && html.replace(reYieldSrc, function (_, ref, text) {
            src[ref] = src[ref] || text;
            // preserve first definition
            return ''
          }).trim();
          return templ.replace(reYieldDest, function (_, ref, def) {
            // yield with from - to attrs
            return src[ref] || def || ''
          }).replace(reYieldAll, function (_, def) {
            // yield without any "from"
            return html || def || ''
          })
        }
        return _mkdom
      }();
      /**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
      function mkitem(expr, key, val) {
        var item = {};
        item[expr.key] = key;
        if (expr.pos)
          item[expr.pos] = val;
        return item
      }
      /**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
      function unmountRedundant(items, tags) {
        var i = tags.length, j = items.length, t;
        while (i > j) {
          t = tags[--i];
          tags.splice(i, 1);
          t.unmount()
        }
      }
      /**
 * Move the nested custom tags in non custom loop tags
 * @param   { Object } child - non custom loop tag
 * @param   { Number } i - current position of the loop tag
 */
      function moveNestedTags(child, i) {
        Object.keys(child.tags).forEach(function (tagName) {
          var tag = child.tags[tagName];
          if (isArray(tag))
            each(tag, function (t) {
              moveChildTag(t, tagName, i)
            });
          else
            moveChildTag(tag, tagName, i)
        })
      }
      /**
 * Adds the elements for a virtual tag
 * @param { Tag } tag - the tag whose root's children will be inserted or appended
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
      function addVirtual(tag, src, target) {
        var el = tag._root, sib;
        tag._virts = [];
        while (el) {
          sib = el.nextSibling;
          if (target)
            src.insertBefore(el, target._root);
          else
            src.appendChild(el);
          tag._virts.push(el);
          // hold for unmounting
          el = sib
        }
      }
      /**
 * Move virtual tag and all child nodes
 * @param { Tag } tag - first child reference used to start move
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 * @param { Number } len - how many child nodes to move
 */
      function moveVirtual(tag, src, target, len) {
        var el = tag._root, sib, i = 0;
        for (; i < len; i++) {
          sib = el.nextSibling;
          src.insertBefore(el, target._root);
          el = sib
        }
      }
      /**
 * Manage tags having the 'each'
 * @param   { Object } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 */
      function _each(dom, parent, expr) {
        // remove the each property from the original tag
        remAttr(dom, 'each');
        var mustReorder = typeof getAttr(dom, 'no-reorder') !== T_STRING || remAttr(dom, 'no-reorder'), tagName = getTagName(dom), impl = __tagImpl[tagName] || { tmpl: dom.outerHTML }, useRoot = SPECIAL_TAGS_REGEX.test(tagName), root = dom.parentNode, ref = document.createTextNode(''), child = getTag(dom), isOption = tagName.toLowerCase() === 'option',
          // the option tags must be treated differently
          tags = [], oldItems = [], hasKeys, isVirtual = dom.tagName == 'VIRTUAL';
        // parse the each expression
        expr = tmpl.loopKeys(expr);
        // insert a marked where the loop tags will be injected
        root.insertBefore(ref, dom);
        // clean template code
        parent.one('before-mount', function () {
          // remove the original DOM node
          dom.parentNode.removeChild(dom);
          if (root.stub)
            root = parent.root
        }).on('update', function () {
          // get the new items collection
          var items = tmpl(expr.val, parent),
            // create a fragment to hold the new DOM nodes to inject in the parent tag
            frag = document.createDocumentFragment();
          // object loop. any changes cause full redraw
          if (!isArray(items)) {
            hasKeys = items || false;
            items = hasKeys ? Object.keys(items).map(function (key) {
              return mkitem(expr, key, items[key])
            }) : []
          }
          // loop all the new items
          var i = 0, itemsLength = items.length;
          for (; i < itemsLength; i++) {
            // reorder only if the items are objects
            var item = items[i], _mustReorder = mustReorder && item instanceof Object && !hasKeys, oldPos = oldItems.indexOf(item), pos = ~oldPos && _mustReorder ? oldPos : i,
              // does a tag exist in this position?
              tag = tags[pos];
            item = !hasKeys && expr.key ? mkitem(expr, item, i) : item;
            // new tag
            if (!_mustReorder && !tag  // with no-reorder we just update the old tags
|| _mustReorder && !~oldPos || !tag  // by default we always try to reorder the DOM elements
) {
              tag = new Tag(impl, {
                parent: parent,
                isLoop: true,
                hasImpl: !!__tagImpl[tagName],
                root: useRoot ? root : dom.cloneNode(),
                item: item
              }, dom.innerHTML);
              tag.mount();
              if (isVirtual)
                tag._root = tag.root.firstChild;
              // save reference for further moves or inserts
              // this tag must be appended
              if (i == tags.length || !tags[i]) {
                // fix 1581
                if (isVirtual)
                  addVirtual(tag, frag);
                else
                  frag.appendChild(tag.root)
              }  // this tag must be insert
              else {
                if (isVirtual)
                  addVirtual(tag, root, tags[i]);
                else
                  root.insertBefore(tag.root, tags[i].root);
                // #1374 some browsers reset selected here
                oldItems.splice(i, 0, item)
              }
              tags.splice(i, 0, tag);
              pos = i  // handled here so no move
            } else
              tag.update(item, true);
            // reorder the tag if it's not located in its previous position
            if (pos !== i && _mustReorder && tags[i]  // fix 1581 unable to reproduce it in a test!
) {
              // update the DOM
              if (isVirtual)
                moveVirtual(tag, root, tags[i], dom.childNodes.length);
              else
                root.insertBefore(tag.root, tags[i].root);
              // update the position attribute if it exists
              if (expr.pos)
                tag[expr.pos] = i;
              // move the old tag instance
              tags.splice(i, 0, tags.splice(pos, 1)[0]);
              // move the old item
              oldItems.splice(i, 0, oldItems.splice(pos, 1)[0]);
              // if the loop tags are not custom
              // we need to move all their custom tags into the right position
              if (!child && tag.tags)
                moveNestedTags(tag, i)
            }
            // cache the original item to use it in the events bound to this node
            // and its children
            tag._item = item;
            // cache the real parent tag internally
            defineProperty(tag, '_parent', parent)
          }
          // remove the redundant tags
          unmountRedundant(items, tags);
          // insert the new nodes
          if (isOption) {
            root.appendChild(frag);
            // #1374 <select> <option selected={true}> </select>
            if (root.length) {
              var si, op = root.options;
              root.selectedIndex = si = -1;
              for (i = 0; i < op.length; i++) {
                if (op[i].selected = op[i].__selected) {
                  if (si < 0)
                    root.selectedIndex = si = i
                }
              }
            }
          } else
            root.insertBefore(frag, ref);
          // set the 'tags' property of the parent tag
          // if child is 'undefined' it means that we don't need to set this property
          // for example:
          // we don't need store the `myTag.tags['div']` property if we are looping a div tag
          // but we need to track the `myTag.tags['child']` property looping a custom child node named `child`
          if (child)
            parent.tags[tagName] = tags;
          // clone the items array
          oldItems = items.slice()
        })
      }
      /**
 * Object that will be used to inject and manage the css of every tag instance
 */
      var styleManager = function (_riot) {
        if (!window)
          return {
            // skip injection on the server
            add: function () {
            },
            inject: function () {
            }
          };
        var styleNode = function () {
          // create a new style element with the correct type
          var newNode = mkEl('style');
          setAttr(newNode, 'type', 'text/css');
          // replace any user node or insert the new one into the head
          var userNode = $('style[type=riot]');
          if (userNode) {
            if (userNode.id)
              newNode.id = userNode.id;
            userNode.parentNode.replaceChild(newNode, userNode)
          } else
            document.getElementsByTagName('head')[0].appendChild(newNode);
          return newNode
        }();
        // Create cache and shortcut to the correct property
        var cssTextProp = styleNode.styleSheet, stylesToInject = '';
        // Expose the style node in a non-modificable property
        Object.defineProperty(_riot, 'styleNode', {
          value: styleNode,
          writable: true
        });
        /**
   * Public api
   */
        return {
          /**
     * Save a tag style to be later injected into DOM
     * @param   { String } css [description]
     */
          add: function (css) {
            stylesToInject += css
          },
          /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     */
          inject: function () {
            if (stylesToInject) {
              if (cssTextProp)
                cssTextProp.cssText += stylesToInject;
              else
                styleNode.innerHTML += stylesToInject;
              stylesToInject = ''
            }
          }
        }
      }(riot);
      function parseNamedElements(root, tag, childTags, forceParsingNamed) {
        walk(root, function (dom) {
          if (dom.nodeType == 1) {
            dom.isLoop = dom.isLoop || (dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each')) ? 1 : 0;
            // custom child tag
            if (childTags) {
              var child = getTag(dom);
              if (child && !dom.isLoop)
                childTags.push(initChildTag(child, {
                  root: dom,
                  parent: tag
                }, dom.innerHTML, tag))
            }
            if (!dom.isLoop || forceParsingNamed)
              setNamed(dom, tag, [])
          }
        })
      }
      function parseExpressions(root, tag, expressions) {
        function addExpr(dom, val, extra) {
          if (tmpl.hasExpr(val)) {
            expressions.push(extend({
              dom: dom,
              expr: val
            }, extra))
          }
        }
        walk(root, function (dom) {
          var type = dom.nodeType, attr;
          // text node
          if (type == 3 && dom.parentNode.tagName != 'STYLE')
            addExpr(dom, dom.nodeValue);
          if (type != 1)
            return;
          /* element */
          // loop
          attr = getAttr(dom, 'each');
          if (attr) {
            _each(dom, tag, attr);
            return false
          }
          // attribute expressions
          each(dom.attributes, function (attr) {
            var name = attr.name, bool = name.split('__')[1];
            addExpr(dom, attr.value, {
              attr: bool || name,
              bool: bool
            });
            if (bool) {
              remAttr(dom, name);
              return false
            }
          });
          // skip custom tags
          if (getTag(dom))
            return false
        })
      }
      function Tag(impl, conf, innerHTML) {
        var self = riot.observable(this), opts = inherit(conf.opts) || {}, parent = conf.parent, isLoop = conf.isLoop, hasImpl = conf.hasImpl, item = cleanUpData(conf.item), expressions = [], childTags = [], root = conf.root, tagName = root.tagName.toLowerCase(), attr = {}, implAttr = {}, propsInSyncWithParent = [], dom;
        // only call unmount if we have a valid __tagImpl (has name property)
        if (impl.name && root._tag)
          root._tag.unmount(true);
        // not yet mounted
        this.isMounted = false;
        root.isLoop = isLoop;
        // keep a reference to the tag just created
        // so we will be able to mount this tag multiple times
        root._tag = this;
        // create a unique id to this tag
        // it could be handy to use it also to improve the virtual dom rendering speed
        defineProperty(this, '_riot_id', ++__uid);
        // base 1 allows test !t._riot_id
        extend(this, {
          parent: parent,
          root: root,
          opts: opts,
          tags: {}
        }, item);
        // grab attributes
        each(root.attributes, function (el) {
          var val = el.value;
          // remember attributes with expressions only
          if (tmpl.hasExpr(val))
            attr[el.name] = val
        });
        dom = mkdom(impl.tmpl, innerHTML);
        // options
        function updateOpts() {
          var ctx = hasImpl && isLoop ? self : parent || self;
          // update opts from current DOM attributes
          each(root.attributes, function (el) {
            var val = el.value;
            opts[toCamel(el.name)] = tmpl.hasExpr(val) ? tmpl(val, ctx) : val
          });
          // recover those with expressions
          each(Object.keys(attr), function (name) {
            opts[toCamel(name)] = tmpl(attr[name], ctx)
          })
        }
        function normalizeData(data) {
          for (var key in item) {
            if (typeof self[key] !== T_UNDEF && isWritable(self, key))
              self[key] = data[key]
          }
        }
        function inheritFromParent() {
          if (!self.parent || !isLoop)
            return;
          each(Object.keys(self.parent), function (k) {
            // some properties must be always in sync with the parent tag
            var mustSync = !contains(RESERVED_WORDS_BLACKLIST, k) && contains(propsInSyncWithParent, k);
            if (typeof self[k] === T_UNDEF || mustSync) {
              // track the property to keep in sync
              // so we can keep it updated
              if (!mustSync)
                propsInSyncWithParent.push(k);
              self[k] = self.parent[k]
            }
          })
        }
        /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @param   { Boolean } isInherited - is this update coming from a parent tag?
   * @returns { self }
   */
        defineProperty(this, 'update', function (data, isInherited) {
          // make sure the data passed will not override
          // the component core methods
          data = cleanUpData(data);
          // inherit properties from the parent
          inheritFromParent();
          // normalize the tag properties in case an item object was initially passed
          if (data && isObject(item)) {
            normalizeData(data);
            item = data
          }
          extend(self, data);
          updateOpts();
          self.trigger('update', data);
          update(expressions, self);
          // the updated event will be triggered
          // once the DOM will be ready and all the re-flows are completed
          // this is useful if you want to get the "real" root properties
          // 4 ex: root.offsetWidth ...
          if (isInherited && self.parent)
            // closes #1599
            self.parent.one('updated', function () {
              self.trigger('updated')
            });
          else
            rAF(function () {
              self.trigger('updated')
            });
          return this
        });
        defineProperty(this, 'mixin', function () {
          each(arguments, function (mix) {
            var instance;
            mix = typeof mix === T_STRING ? riot.mixin(mix) : mix;
            // check if the mixin is a function
            if (isFunction(mix)) {
              // create the new mixin instance
              instance = new mix;
              // save the prototype to loop it afterwards
              mix = mix.prototype
            } else
              instance = mix;
            // loop the keys in the function prototype or the all object keys
            each(Object.getOwnPropertyNames(mix), function (key) {
              // bind methods to self
              if (key != 'init')
                self[key] = isFunction(instance[key]) ? instance[key].bind(self) : instance[key]
            });
            // init method will be called automatically
            if (instance.init)
              instance.init.bind(self)()
          });
          return this
        });
        defineProperty(this, 'mount', function () {
          updateOpts();
          // add global mixin
          var globalMixin = riot.mixin(GLOBAL_MIXIN);
          if (globalMixin)
            self.mixin(globalMixin);
          // initialiation
          if (impl.fn)
            impl.fn.call(self, opts);
          // parse layout after init. fn may calculate args for nested custom tags
          parseExpressions(dom, self, expressions);
          // mount the child tags
          toggle(true);
          // update the root adding custom attributes coming from the compiler
          // it fixes also #1087
          if (impl.attrs)
            walkAttributes(impl.attrs, function (k, v) {
              setAttr(root, k, v)
            });
          if (impl.attrs || hasImpl)
            parseExpressions(self.root, self, expressions);
          if (!self.parent || isLoop)
            self.update(item);
          // internal use only, fixes #403
          self.trigger('before-mount');
          if (isLoop && !hasImpl) {
            // update the root attribute for the looped elements
            root = dom.firstChild
          } else {
            while (dom.firstChild)
              root.appendChild(dom.firstChild);
            if (root.stub)
              root = parent.root
          }
          defineProperty(self, 'root', root);
          // parse the named dom nodes in the looped child
          // adding them to the parent as well
          if (isLoop)
            parseNamedElements(self.root, self.parent, null, true);
          // if it's not a child tag we can trigger its mount event
          if (!self.parent || self.parent.isMounted) {
            self.isMounted = true;
            self.trigger('mount')
          }  // otherwise we need to wait that the parent event gets triggered
          else
            self.parent.one('mount', function () {
              // avoid to trigger the `mount` event for the tags
              // not visible included in an if statement
              if (!isInStub(self.root)) {
                self.parent.isMounted = self.isMounted = true;
                self.trigger('mount')
              }
            })
        });
        defineProperty(this, 'unmount', function (keepRootTag) {
          var el = root, p = el.parentNode, ptag, tagIndex = __virtualDom.indexOf(self);
          self.trigger('before-unmount');
          // remove this tag instance from the global virtualDom variable
          if (~tagIndex)
            __virtualDom.splice(tagIndex, 1);
          if (this._virts) {
            each(this._virts, function (v) {
              if (v.parentNode)
                v.parentNode.removeChild(v)
            })
          }
          if (p) {
            if (parent) {
              ptag = getImmediateCustomParentTag(parent);
              // remove this tag from the parent tags object
              // if there are multiple nested tags with same name..
              // remove this element form the array
              if (isArray(ptag.tags[tagName]))
                each(ptag.tags[tagName], function (tag, i) {
                  if (tag._riot_id == self._riot_id)
                    ptag.tags[tagName].splice(i, 1)
                });
              else
                // otherwise just delete the tag instance
                ptag.tags[tagName] = undefined
            } else
              while (el.firstChild)
                el.removeChild(el.firstChild);
            if (!keepRootTag)
              p.removeChild(el);
            else
              // the riot-tag attribute isn't needed anymore, remove it
              remAttr(p, 'riot-tag')
          }
          self.trigger('unmount');
          toggle();
          self.off('*');
          self.isMounted = false;
          delete root._tag
        });
        // proxy function to bind updates
        // dispatched from a parent tag
        function onChildUpdate(data) {
          self.update(data, true)
        }
        function toggle(isMount) {
          // mount/unmount children
          each(childTags, function (child) {
            child[isMount ? 'mount' : 'unmount']()
          });
          // listen/unlisten parent (events flow one way from parent to children)
          if (!parent)
            return;
          var evt = isMount ? 'on' : 'off';
          // the loop tags will be always in sync with the parent automatically
          if (isLoop)
            parent[evt]('unmount', self.unmount);
          else {
            parent[evt]('update', onChildUpdate)[evt]('unmount', self.unmount)
          }
        }
        // named elements available for fn
        parseNamedElements(dom, this, childTags)
      }
      /**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
      function setEventHandler(name, handler, dom, tag) {
        dom[name] = function (e) {
          var ptag = tag._parent, item = tag._item, el;
          if (!item)
            while (ptag && !item) {
              item = ptag._item;
              ptag = ptag._parent
            }
          // cross browser event fix
          e = e || window.event;
          // override the event properties
          if (isWritable(e, 'currentTarget'))
            e.currentTarget = dom;
          if (isWritable(e, 'target'))
            e.target = e.srcElement;
          if (isWritable(e, 'which'))
            e.which = e.charCode || e.keyCode;
          e.item = item;
          // prevent default behaviour (by default)
          if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
            if (e.preventDefault)
              e.preventDefault();
            e.returnValue = false
          }
          if (!e.preventUpdate) {
            el = item ? getImmediateCustomParentTag(ptag) : tag;
            el.update()
          }
        }
      }
      /**
 * Insert a DOM node replacing another one (used by if- attribute)
 * @param   { Object } root - parent node
 * @param   { Object } node - node replaced
 * @param   { Object } before - node added
 */
      function insertTo(root, node, before) {
        if (!root)
          return;
        root.insertBefore(before, node);
        root.removeChild(node)
      }
      /**
 * Update the expressions in a Tag instance
 * @param   { Array } expressions - expression that must be re evaluated
 * @param   { Tag } tag - tag instance
 */
      function update(expressions, tag) {
        each(expressions, function (expr, i) {
          var dom = expr.dom, attrName = expr.attr, value = tmpl(expr.expr, tag), parent = expr.dom.parentNode;
          if (expr.bool) {
            value = !!value;
            if (attrName === 'selected')
              dom.__selected = value  // #1374
          } else if (value == null)
            value = '';
          // #1638: regression of #1612, update the dom only if the value of the
          // expression was changed
          if (expr.value === value) {
            return
          }
          expr.value = value;
          // textarea and text nodes has no attribute name
          if (!attrName) {
            // about #815 w/o replace: the browser converts the value to a string,
            // the comparison by "==" does too, but not in the server
            value += '';
            // test for parent avoids error with invalid assignment to nodeValue
            if (parent) {
              if (parent.tagName === 'TEXTAREA') {
                parent.value = value;
                // #1113
                if (!IE_VERSION)
                  dom.nodeValue = value  // #1625 IE throws here, nodeValue
              }  // will be available on 'updated'
              else
                dom.nodeValue = value
            }
            return
          }
          // ~~#1612: look for changes in dom.value when updating the value~~
          if (attrName === 'value') {
            dom.value = value;
            return
          }
          // remove original attribute
          remAttr(dom, attrName);
          // event handler
          if (isFunction(value)) {
            setEventHandler(attrName, value, dom, tag)  // if- conditional
          } else if (attrName == 'if') {
            var stub = expr.stub, add = function () {
                insertTo(stub.parentNode, stub, dom)
              }, remove = function () {
                insertTo(dom.parentNode, dom, stub)
              };
            // add to DOM
            if (value) {
              if (stub) {
                add();
                dom.inStub = false;
                // avoid to trigger the mount event if the tags is not visible yet
                // maybe we can optimize this avoiding to mount the tag at all
                if (!isInStub(dom)) {
                  walk(dom, function (el) {
                    if (el._tag && !el._tag.isMounted)
                      el._tag.isMounted = !!el._tag.trigger('mount')
                  })
                }
              }  // remove from DOM
            } else {
              stub = expr.stub = stub || document.createTextNode('');
              // if the parentNode is defined we can easily replace the tag
              if (dom.parentNode)
                remove()  // otherwise we need to wait the updated event
;
              else
                (tag.parent || tag).one('updated', remove);
              dom.inStub = true
            }  // show / hide
          } else if (attrName === 'show') {
            dom.style.display = value ? '' : 'none'
          } else if (attrName === 'hide') {
            dom.style.display = value ? 'none' : ''
          } else if (expr.bool) {
            dom[attrName] = value;
            if (value)
              setAttr(dom, attrName, attrName)
          } else if (value === 0 || value && typeof value !== T_OBJECT) {
            // <img src="{ expr }">
            if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
              attrName = attrName.slice(RIOT_PREFIX.length)
            }
            setAttr(dom, attrName, value)
          }
        })
      }
      /**
 * Specialized function for looping an array-like collection with `each={}`
 * @param   { Array } els - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
      function each(els, fn) {
        var len = els ? els.length : 0;
        for (var i = 0, el; i < len; i++) {
          el = els[i];
          // return false -> current item was removed by fn during the loop
          if (el != null && fn(el, i) === false)
            i--
        }
        return els
      }
      /**
 * Detect if the argument passed is a function
 * @param   { * } v - whatever you want to pass to this function
 * @returns { Boolean } -
 */
      function isFunction(v) {
        return typeof v === T_FUNCTION || false  // avoid IE problems
      }
      /**
 * Detect if the argument passed is an object, exclude null.
 * NOTE: Use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } v - whatever you want to pass to this function
 * @returns { Boolean } -
 */
      function isObject(v) {
        return v && typeof v === T_OBJECT  // typeof null is 'object'
      }
      /**
 * Remove any DOM attribute from a node
 * @param   { Object } dom - DOM node we want to update
 * @param   { String } name - name of the property we want to remove
 */
      function remAttr(dom, name) {
        dom.removeAttribute(name)
      }
      /**
 * Convert a string containing dashes to camel case
 * @param   { String } string - input string
 * @returns { String } my-string -> myString
 */
      function toCamel(string) {
        return string.replace(/-(\w)/g, function (_, c) {
          return c.toUpperCase()
        })
      }
      /**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
      function getAttr(dom, name) {
        return dom.getAttribute(name)
      }
      /**
 * Set any DOM attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
      function setAttr(dom, name, val) {
        dom.setAttribute(name, val)
      }
      /**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
      function getTag(dom) {
        return dom.tagName && __tagImpl[getAttr(dom, RIOT_TAG_IS) || getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()]
      }
      /**
 * Add a child tag to its parent into the `tags` object
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the new tag will be stored
 * @param   { Object } parent - tag instance where the new child tag will be included
 */
      function addChildTag(tag, tagName, parent) {
        var cachedTag = parent.tags[tagName];
        // if there are multiple children tags having the same name
        if (cachedTag) {
          // if the parent tags property is not yet an array
          // create it adding the first cached tag
          if (!isArray(cachedTag))
            // don't add the same tag twice
            if (cachedTag !== tag)
              parent.tags[tagName] = [cachedTag];
          // add the new nested tag to the array
          if (!contains(parent.tags[tagName], tag))
            parent.tags[tagName].push(tag)
        } else {
          parent.tags[tagName] = tag
        }
      }
      /**
 * Move the position of a custom tag in its parent tag
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
      function moveChildTag(tag, tagName, newPos) {
        var parent = tag.parent, tags;
        // no parent no move
        if (!parent)
          return;
        tags = parent.tags[tagName];
        if (isArray(tags))
          tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0]);
        else
          addChildTag(tag, tagName, parent)
      }
      /**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
      function initChildTag(child, opts, innerHTML, parent) {
        var tag = new Tag(child, opts, innerHTML), tagName = getTagName(opts.root), ptag = getImmediateCustomParentTag(parent);
        // fix for the parent attribute in the looped elements
        tag.parent = ptag;
        // store the real parent tag
        // in some cases this could be different from the custom parent tag
        // for example in nested loops
        tag._parent = parent;
        // add this tag to the custom parent tag
        addChildTag(tag, tagName, ptag);
        // and also to the real parent tag
        if (ptag !== parent)
          addChildTag(tag, tagName, parent);
        // empty the child node once we got its template
        // to avoid that its children get compiled multiple times
        opts.root.innerHTML = '';
        return tag
      }
      /**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
      function getImmediateCustomParentTag(tag) {
        var ptag = tag;
        while (!getTag(ptag.root)) {
          if (!ptag.parent)
            break;
          ptag = ptag.parent
        }
        return ptag
      }
      /**
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
* @param   { Object } options - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
      function defineProperty(el, key, value, options) {
        Object.defineProperty(el, key, extend({
          value: value,
          enumerable: false,
          writable: false,
          configurable: false
        }, options));
        return el
      }
      /**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @returns { String } name to identify this dom node in riot
 */
      function getTagName(dom) {
        var child = getTag(dom), namedTag = getAttr(dom, 'name'), tagName = namedTag && !tmpl.hasExpr(namedTag) ? namedTag : child ? child.name : dom.tagName.toLowerCase();
        return tagName
      }
      /**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
      function extend(src) {
        var obj, args = arguments;
        for (var i = 1; i < args.length; ++i) {
          if (obj = args[i]) {
            for (var key in obj) {
              // check if this property of the source object could be overridden
              if (isWritable(src, key))
                src[key] = obj[key]
            }
          }
        }
        return src
      }
      /**
 * Check whether an array contains an item
 * @param   { Array } arr - target array
 * @param   { * } item - item to test
 * @returns { Boolean } Does 'arr' contain 'item'?
 */
      function contains(arr, item) {
        return ~arr.indexOf(item)
      }
      /**
 * Check whether an object is a kind of array
 * @param   { * } a - anything
 * @returns {Boolean} is 'a' an array?
 */
      function isArray(a) {
        return Array.isArray(a) || a instanceof Array
      }
      /**
 * Detect whether a property of an object could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } is this property writable?
 */
      function isWritable(obj, key) {
        var props = Object.getOwnPropertyDescriptor(obj, key);
        return typeof obj[key] === T_UNDEF || props && props.writable
      }
      /**
 * With this function we avoid that the internal Tag methods get overridden
 * @param   { Object } data - options we want to use to extend the tag instance
 * @returns { Object } clean object without containing the riot internal reserved words
 */
      function cleanUpData(data) {
        if (!(data instanceof Tag) && !(data && typeof data.trigger == T_FUNCTION))
          return data;
        var o = {};
        for (var key in data) {
          if (!contains(RESERVED_WORDS_BLACKLIST, key))
            o[key] = data[key]
        }
        return o
      }
      /**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 */
      function walk(dom, fn) {
        if (dom) {
          // stop the recursion
          if (fn(dom) === false)
            return;
          else {
            dom = dom.firstChild;
            while (dom) {
              walk(dom, fn);
              dom = dom.nextSibling
            }
          }
        }
      }
      /**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
      function walkAttributes(html, fn) {
        var m, re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g;
        while (m = re.exec(html)) {
          fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
        }
      }
      /**
 * Check whether a DOM node is in stub mode, useful for the riot 'if' directive
 * @param   { Object }  dom - DOM node we want to parse
 * @returns { Boolean } -
 */
      function isInStub(dom) {
        while (dom) {
          if (dom.inStub)
            return true;
          dom = dom.parentNode
        }
        return false
      }
      /**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @returns { Object } DOM node just created
 */
      function mkEl(name) {
        return document.createElement(name)
      }
      /**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
      function $$(selector, ctx) {
        return (ctx || document).querySelectorAll(selector)
      }
      /**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
      function $(selector, ctx) {
        return (ctx || document).querySelector(selector)
      }
      /**
 * Simple object prototypal inheritance
 * @param   { Object } parent - parent object
 * @returns { Object } child instance
 */
      function inherit(parent) {
        function Child() {
        }
        Child.prototype = parent;
        return new Child
      }
      /**
 * Get the name property needed to identify a DOM node in riot
 * @param   { Object } dom - DOM node we need to parse
 * @returns { String | undefined } give us back a string to identify this dom node
 */
      function getNamedKey(dom) {
        return getAttr(dom, 'id') || getAttr(dom, 'name')
      }
      /**
 * Set the named properties of a tag element
 * @param { Object } dom - DOM node we need to parse
 * @param { Object } parent - tag instance where the named dom element will be eventually added
 * @param { Array } keys - list of all the tag instance properties
 */
      function setNamed(dom, parent, keys) {
        // get the key value we want to add to the tag instance
        var key = getNamedKey(dom), isArr,
          // add the node detected to a tag instance using the named property
          add = function (value) {
            // avoid to override the tag properties already set
            if (contains(keys, key))
              return;
            // check whether this value is an array
            isArr = isArray(value);
            // if the key was never set
            if (!value)
              // set it once on the tag instance
              parent[key] = dom  // if it was an array and not yet set
;
            else if (!isArr || isArr && !contains(value, dom)) {
              // add the dom node into the array
              if (isArr)
                value.push(dom);
              else
                parent[key] = [
                  value,
                  dom
                ]
            }
          };
        // skip the elements with no named properties
        if (!key)
          return;
        // check whether this key has been already evaluated
        if (tmpl.hasExpr(key))
          // wait the first updated event only once
          parent.one('mount', function () {
            key = getNamedKey(dom);
            add(parent[key])
          });
        else
          add(parent[key])
      }
      /**
 * Faster String startsWith alternative
 * @param   { String } src - source string
 * @param   { String } str - test string
 * @returns { Boolean } -
 */
      function startsWith(src, str) {
        return src.slice(0, str.length) === str
      }
      /**
 * requestAnimationFrame function
 * Adapted from https://gist.github.com/paulirish/1579671, license MIT
 */
      var rAF = function (w) {
        var raf = w.requestAnimationFrame || w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame;
        if (!raf || /iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)) {
          // buggy iOS6
          var lastTime = 0;
          raf = function (cb) {
            var nowtime = Date.now(), timeout = Math.max(16 - (nowtime - lastTime), 0);
            setTimeout(function () {
              cb(lastTime = nowtime + timeout)
            }, timeout)
          }
        }
        return raf
      }(window || {});
      /**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @returns { Tag } a new Tag instance
 */
      function mountTo(root, tagName, opts) {
        var tag = __tagImpl[tagName],
          // cache the inner HTML to fix #855
          innerHTML = root._innerHTML = root._innerHTML || root.innerHTML;
        // clear the inner html
        root.innerHTML = '';
        if (tag && root)
          tag = new Tag(tag, {
            root: root,
            opts: opts
          }, innerHTML);
        if (tag && tag.mount) {
          tag.mount();
          // add this tag to the virtualDom variable
          if (!contains(__virtualDom, tag))
            __virtualDom.push(tag)
        }
        return tag
      }
      /**
 * Riot public api
 */
      // share methods for other riot parts, e.g. compiler
      riot.util = {
        brackets: brackets,
        tmpl: tmpl
      };
      /**
 * Create a mixin that could be globally shared across all the tags
 */
      riot.mixin = function () {
        var mixins = {};
        /**
   * Create/Return a mixin by its name
   * @param   { String } name - mixin name (global mixin if missing)
   * @param   { Object } mixin - mixin logic
   * @returns { Object } the mixin logic
   */
        return function (name, mixin) {
          if (isObject(name)) {
            mixin = name;
            mixins[GLOBAL_MIXIN] = extend(mixins[GLOBAL_MIXIN] || {}, mixin);
            return
          }
          if (!mixin)
            return mixins[name];
          mixins[name] = mixin
        }
      }();
      /**
 * Create a new riot tag implementation
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   html - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
      riot.tag = function (name, html, css, attrs, fn) {
        if (isFunction(attrs)) {
          fn = attrs;
          if (/^[\w\-]+\s?=/.test(css)) {
            attrs = css;
            css = ''
          } else
            attrs = ''
        }
        if (css) {
          if (isFunction(css))
            fn = css;
          else
            styleManager.add(css)
        }
        name = name.toLowerCase();
        __tagImpl[name] = {
          name: name,
          tmpl: html,
          attrs: attrs,
          fn: fn
        };
        return name
      };
      /**
 * Create a new riot tag implementation (for use by the compiler)
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   html - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
      riot.tag2 = function (name, html, css, attrs, fn) {
        if (css)
          styleManager.add(css);
        //if (bpair) riot.settings.brackets = bpair
        __tagImpl[name] = {
          name: name,
          tmpl: html,
          attrs: attrs,
          fn: fn
        };
        return name
      };
      /**
 * Mount a tag using a specific tag implementation
 * @param   { String } selector - tag DOM selector
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
      riot.mount = function (selector, tagName, opts) {
        var els, allTags, tags = [];
        // helper functions
        function addRiotTags(arr) {
          var list = '';
          each(arr, function (e) {
            if (!/[^-\w]/.test(e)) {
              e = e.trim().toLowerCase();
              list += ',[' + RIOT_TAG_IS + '="' + e + '"],[' + RIOT_TAG + '="' + e + '"]'
            }
          });
          return list
        }
        function selectAllTags() {
          var keys = Object.keys(__tagImpl);
          return keys + addRiotTags(keys)
        }
        function pushTags(root) {
          if (root.tagName) {
            var riotTag = getAttr(root, RIOT_TAG_IS) || getAttr(root, RIOT_TAG);
            // have tagName? force riot-tag to be the same
            if (tagName && riotTag !== tagName) {
              riotTag = tagName;
              setAttr(root, RIOT_TAG_IS, tagName)
            }
            var tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts);
            if (tag)
              tags.push(tag)
          } else if (root.length) {
            each(root, pushTags)  // assume nodeList
          }
        }
        // ----- mount code -----
        // inject styles into DOM
        styleManager.inject();
        if (isObject(tagName)) {
          opts = tagName;
          tagName = 0
        }
        // crawl the DOM to find the tag
        if (typeof selector === T_STRING) {
          if (selector === '*')
            // select all the tags registered
            // and also the tags found with the riot-tag attribute set
            selector = allTags = selectAllTags();
          else
            // or just the ones named like the selector
            selector += addRiotTags(selector.split(/, */));
          // make sure to pass always a selector
          // to the querySelectorAll function
          els = selector ? $$(selector) : []
        } else
          // probably you have passed already a tag or a NodeList
          els = selector;
        // select all the registered and mount them inside their root elements
        if (tagName === '*') {
          // get all custom tags
          tagName = allTags || selectAllTags();
          // if the root els it's just a single tag
          if (els.tagName)
            els = $$(tagName, els);
          else {
            // select all the children for all the different root elements
            var nodeList = [];
            each(els, function (_el) {
              nodeList.push($$(tagName, _el))
            });
            els = nodeList
          }
          // get rid of the tagName
          tagName = 0
        }
        pushTags(els);
        return tags
      };
      /**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
      riot.update = function () {
        return each(__virtualDom, function (tag) {
          tag.update()
        })
      };
      /**
 * Export the Tag constructor
 */
      riot.Tag = Tag;
      // support CommonJS, AMD & browser
      /* istanbul ignore next */
      if (typeof exports === T_OBJECT)
        module.exports = riot;
      else if (typeof define === T_FUNCTION && typeof define.amd !== T_UNDEF)
        define(function () {
          return riot
        });
      else
        window.riot = riot
    }(typeof window != 'undefined' ? window : void 0))
  });
  // source: node_modules/referential/lib/index.js
  require.define('referential/lib', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var refer;
    refer = require('referential/lib/refer');
    refer.Ref = require('referential/lib/ref');
    module.exports = refer  //# sourceMappingURL=index.js.map
  });
  // source: node_modules/referential/lib/refer.js
  require.define('referential/lib/refer', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Ref, refer;
    Ref = require('referential/lib/ref');
    module.exports = refer = function (state, ref) {
      var fn, i, len, method, ref1, wrapper;
      if (ref == null) {
        ref = null
      }
      if (ref == null) {
        ref = new Ref(state)
      }
      wrapper = function (key) {
        return ref.get(key)
      };
      ref1 = [
        'value',
        'get',
        'set',
        'extend',
        'index',
        'ref'
      ];
      fn = function (method) {
        return wrapper[method] = function () {
          return ref[method].apply(ref, arguments)
        }
      };
      for (i = 0, len = ref1.length; i < len; i++) {
        method = ref1[i];
        fn(method)
      }
      wrapper.refer = function (key) {
        return refer(null, ref.ref(key))
      };
      wrapper.clone = function (key) {
        return refer(null, ref.clone(key))
      };
      return wrapper
    }  //# sourceMappingURL=refer.js.map
  });
  // source: node_modules/referential/lib/ref.js
  require.define('referential/lib/ref', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Ref, extend, isArray, isNumber, isObject, isString;
    extend = require('node.extend');
    isArray = require('is-array');
    isNumber = require('is-number');
    isObject = require('is-object');
    isString = require('is-string');
    module.exports = Ref = function () {
      function Ref(_value, parent, key1) {
        this._value = _value;
        this.parent = parent;
        this.key = key1;
        this._cache = {}
      }
      Ref.prototype._mutate = function () {
        return this._cache = {}
      };
      Ref.prototype.value = function (state) {
        if (!this.parent) {
          if (state != null) {
            this._value = state
          }
          return this._value
        }
        if (state != null) {
          return this.parent.set(this.key, state)
        } else {
          return this.parent.get(this.key)
        }
      };
      Ref.prototype.ref = function (key) {
        if (!key) {
          return this
        }
        return new Ref(null, this, key)
      };
      Ref.prototype.get = function (key) {
        if (!key) {
          return this.value()
        } else {
          if (this._cache[key]) {
            return this._cache[key]
          }
          return this._cache[key] = this.index(key)
        }
      };
      Ref.prototype.set = function (key, value) {
        this._mutate();
        if (value == null) {
          this.value(extend(this.value(), key))
        } else {
          this.index(key, value)
        }
        return this
      };
      Ref.prototype.extend = function (key, value) {
        var clone;
        this._mutate();
        if (value == null) {
          this.value(extend(true, this.value(), key))
        } else {
          if (isObject(value)) {
            this.value(extend(true, this.ref(key).get(), value))
          } else {
            clone = this.clone();
            this.set(key, value);
            this.value(extend(true, clone.get(), this.value()))
          }
        }
        return this
      };
      Ref.prototype.clone = function (key) {
        return new Ref(extend(true, {}, this.get(key)))
      };
      Ref.prototype.index = function (key, value, obj, prev) {
        var next, prop, props;
        if (obj == null) {
          obj = this.value()
        }
        if (this.parent) {
          return this.parent.index(this.key + '.' + key, value)
        }
        if (isNumber(key)) {
          key = String(key)
        }
        props = key.split('.');
        if (value == null) {
          while (prop = props.shift()) {
            if (!props.length) {
              return obj != null ? obj[prop] : void 0
            }
            obj = obj != null ? obj[prop] : void 0
          }
          return
        }
        while (prop = props.shift()) {
          if (!props.length) {
            return obj[prop] = value
          } else {
            next = props[0];
            if (obj[next] == null) {
              if (isNumber(next)) {
                if (obj[prop] == null) {
                  obj[prop] = []
                }
              } else {
                if (obj[prop] == null) {
                  obj[prop] = {}
                }
              }
            }
          }
          obj = obj[prop]
        }
      };
      return Ref
    }()  //# sourceMappingURL=ref.js.map
  });
  // source: node_modules/node.extend/index.js
  require.define('node.extend', function (module, exports, __dirname, __filename, process) {
    module.exports = require('node.extend/lib/extend')
  });
  // source: node_modules/node.extend/lib/extend.js
  require.define('node.extend/lib/extend', function (module, exports, __dirname, __filename, process) {
    /*!
 * node.extend
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * @fileoverview
 * Port of jQuery.extend that actually works on node.js
 */
    var is = require('is');
    function extend() {
      var target = arguments[0] || {};
      var i = 1;
      var length = arguments.length;
      var deep = false;
      var options, name, src, copy, copy_is_array, clone;
      // Handle a deep copy situation
      if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2
      }
      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== 'object' && !is.fn(target)) {
        target = {}
      }
      for (; i < length; i++) {
        // Only deal with non-null/undefined values
        options = arguments[i];
        if (options != null) {
          if (typeof options === 'string') {
            options = options.split('')
          }
          // Extend the base object
          for (name in options) {
            src = target[name];
            copy = options[name];
            // Prevent never-ending loop
            if (target === copy) {
              continue
            }
            // Recurse if we're merging plain objects or arrays
            if (deep && copy && (is.hash(copy) || (copy_is_array = is.array(copy)))) {
              if (copy_is_array) {
                copy_is_array = false;
                clone = src && is.array(src) ? src : []
              } else {
                clone = src && is.hash(src) ? src : {}
              }
              // Never move original objects, clone them
              target[name] = extend(deep, clone, copy)  // Don't bring in undefined values
            } else if (typeof copy !== 'undefined') {
              target[name] = copy
            }
          }
        }
      }
      // Return the modified object
      return target
    }
    ;
    /**
 * @public
 */
    extend.version = '1.1.3';
    /**
 * Exports module.
 */
    module.exports = extend
  });
  // source: node_modules/is/index.js
  require.define('is', function (module, exports, __dirname, __filename, process) {
    /* globals window, HTMLElement */
    /**!
 * is
 * the definitive JavaScript type testing library
 *
 * @copyright 2013-2014 Enrico Marino / Jordan Harband
 * @license MIT
 */
    var objProto = Object.prototype;
    var owns = objProto.hasOwnProperty;
    var toStr = objProto.toString;
    var symbolValueOf;
    if (typeof Symbol === 'function') {
      symbolValueOf = Symbol.prototype.valueOf
    }
    var isActualNaN = function (value) {
      return value !== value
    };
    var NON_HOST_TYPES = {
      'boolean': 1,
      number: 1,
      string: 1,
      undefined: 1
    };
    var base64Regex = /^([A-Za-z0-9+\/]{4})*([A-Za-z0-9+\/]{4}|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{2}==)$/;
    var hexRegex = /^[A-Fa-f0-9]+$/;
    /**
 * Expose `is`
 */
    var is = module.exports = {};
    /**
 * Test general.
 */
    /**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */
    is.a = is.type = function (value, type) {
      return typeof value === type
    };
    /**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */
    is.defined = function (value) {
      return typeof value !== 'undefined'
    };
    /**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */
    is.empty = function (value) {
      var type = toStr.call(value);
      var key;
      if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
        return value.length === 0
      }
      if (type === '[object Object]') {
        for (key in value) {
          if (owns.call(value, key)) {
            return false
          }
        }
        return true
      }
      return !value
    };
    /**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */
    is.equal = function equal(value, other) {
      if (value === other) {
        return true
      }
      var type = toStr.call(value);
      var key;
      if (type !== toStr.call(other)) {
        return false
      }
      if (type === '[object Object]') {
        for (key in value) {
          if (!is.equal(value[key], other[key]) || !(key in other)) {
            return false
          }
        }
        for (key in other) {
          if (!is.equal(value[key], other[key]) || !(key in value)) {
            return false
          }
        }
        return true
      }
      if (type === '[object Array]') {
        key = value.length;
        if (key !== other.length) {
          return false
        }
        while (--key) {
          if (!is.equal(value[key], other[key])) {
            return false
          }
        }
        return true
      }
      if (type === '[object Function]') {
        return value.prototype === other.prototype
      }
      if (type === '[object Date]') {
        return value.getTime() === other.getTime()
      }
      return false
    };
    /**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */
    is.hosted = function (value, host) {
      var type = typeof host[value];
      return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type]
    };
    /**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */
    is.instance = is['instanceof'] = function (value, constructor) {
      return value instanceof constructor
    };
    /**
 * is.nil / is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */
    is.nil = is['null'] = function (value) {
      return value === null
    };
    /**
 * is.undef / is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */
    is.undef = is.undefined = function (value) {
      return typeof value === 'undefined'
    };
    /**
 * Test arguments.
 */
    /**
 * is.args
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */
    is.args = is.arguments = function (value) {
      var isStandardArguments = toStr.call(value) === '[object Arguments]';
      var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
      return isStandardArguments || isOldArguments
    };
    /**
 * Test array.
 */
    /**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */
    is.array = Array.isArray || function (value) {
      return toStr.call(value) === '[object Array]'
    };
    /**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
    is.args.empty = function (value) {
      return is.args(value) && value.length === 0
    };
    /**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
    is.array.empty = function (value) {
      return is.array(value) && value.length === 0
    };
    /**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */
    is.arraylike = function (value) {
      return !!value && !is.bool(value) && owns.call(value, 'length') && isFinite(value.length) && is.number(value.length) && value.length >= 0
    };
    /**
 * Test boolean.
 */
    /**
 * is.bool
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */
    is.bool = is['boolean'] = function (value) {
      return toStr.call(value) === '[object Boolean]'
    };
    /**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */
    is['false'] = function (value) {
      return is.bool(value) && Boolean(Number(value)) === false
    };
    /**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */
    is['true'] = function (value) {
      return is.bool(value) && Boolean(Number(value)) === true
    };
    /**
 * Test date.
 */
    /**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */
    is.date = function (value) {
      return toStr.call(value) === '[object Date]'
    };
    /**
 * Test element.
 */
    /**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */
    is.element = function (value) {
      return value !== undefined && typeof HTMLElement !== 'undefined' && value instanceof HTMLElement && value.nodeType === 1
    };
    /**
 * Test error.
 */
    /**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */
    is.error = function (value) {
      return toStr.call(value) === '[object Error]'
    };
    /**
 * Test function.
 */
    /**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */
    is.fn = is['function'] = function (value) {
      var isAlert = typeof window !== 'undefined' && value === window.alert;
      return isAlert || toStr.call(value) === '[object Function]'
    };
    /**
 * Test number.
 */
    /**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */
    is.number = function (value) {
      return toStr.call(value) === '[object Number]'
    };
    /**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
    is.infinite = function (value) {
      return value === Infinity || value === -Infinity
    };
    /**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */
    is.decimal = function (value) {
      return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0
    };
    /**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */
    is.divisibleBy = function (value, n) {
      var isDividendInfinite = is.infinite(value);
      var isDivisorInfinite = is.infinite(n);
      var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
      return isDividendInfinite || isDivisorInfinite || isNonZeroNumber && value % n === 0
    };
    /**
 * is.integer
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */
    is.integer = is['int'] = function (value) {
      return is.number(value) && !isActualNaN(value) && value % 1 === 0
    };
    /**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */
    is.maximum = function (value, others) {
      if (isActualNaN(value)) {
        throw new TypeError('NaN is not a valid value')
      } else if (!is.arraylike(others)) {
        throw new TypeError('second argument must be array-like')
      }
      var len = others.length;
      while (--len >= 0) {
        if (value < others[len]) {
          return false
        }
      }
      return true
    };
    /**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */
    is.minimum = function (value, others) {
      if (isActualNaN(value)) {
        throw new TypeError('NaN is not a valid value')
      } else if (!is.arraylike(others)) {
        throw new TypeError('second argument must be array-like')
      }
      var len = others.length;
      while (--len >= 0) {
        if (value > others[len]) {
          return false
        }
      }
      return true
    };
    /**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */
    is.nan = function (value) {
      return !is.number(value) || value !== value
    };
    /**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */
    is.even = function (value) {
      return is.infinite(value) || is.number(value) && value === value && value % 2 === 0
    };
    /**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */
    is.odd = function (value) {
      return is.infinite(value) || is.number(value) && value === value && value % 2 !== 0
    };
    /**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */
    is.ge = function (value, other) {
      if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError('NaN is not a valid value')
      }
      return !is.infinite(value) && !is.infinite(other) && value >= other
    };
    /**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */
    is.gt = function (value, other) {
      if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError('NaN is not a valid value')
      }
      return !is.infinite(value) && !is.infinite(other) && value > other
    };
    /**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */
    is.le = function (value, other) {
      if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError('NaN is not a valid value')
      }
      return !is.infinite(value) && !is.infinite(other) && value <= other
    };
    /**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */
    is.lt = function (value, other) {
      if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError('NaN is not a valid value')
      }
      return !is.infinite(value) && !is.infinite(other) && value < other
    };
    /**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
    is.within = function (value, start, finish) {
      if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
        throw new TypeError('NaN is not a valid value')
      } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
        throw new TypeError('all arguments must be numbers')
      }
      var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
      return isAnyInfinite || value >= start && value <= finish
    };
    /**
 * Test object.
 */
    /**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */
    is.object = function (value) {
      return toStr.call(value) === '[object Object]'
    };
    /**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */
    is.hash = function (value) {
      return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval
    };
    /**
 * Test regexp.
 */
    /**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */
    is.regexp = function (value) {
      return toStr.call(value) === '[object RegExp]'
    };
    /**
 * Test string.
 */
    /**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */
    is.string = function (value) {
      return toStr.call(value) === '[object String]'
    };
    /**
 * Test base64 string.
 */
    /**
 * is.base64
 * Test if `value` is a valid base64 encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a base64 encoded string, false otherwise
 * @api public
 */
    is.base64 = function (value) {
      return is.string(value) && (!value.length || base64Regex.test(value))
    };
    /**
 * Test base64 string.
 */
    /**
 * is.hex
 * Test if `value` is a valid hex encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a hex encoded string, false otherwise
 * @api public
 */
    is.hex = function (value) {
      return is.string(value) && (!value.length || hexRegex.test(value))
    };
    /**
 * is.symbol
 * Test if `value` is an ES6 Symbol
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a Symbol, false otherise
 * @api public
 */
    is.symbol = function (value) {
      return typeof Symbol === 'function' && toStr.call(value) === '[object Symbol]' && typeof symbolValueOf.call(value) === 'symbol'
    }
  });
  // source: node_modules/is-array/index.js
  require.define('is-array', function (module, exports, __dirname, __filename, process) {
    /**
 * isArray
 */
    var isArray = Array.isArray;
    /**
 * toString
 */
    var str = Object.prototype.toString;
    /**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */
    module.exports = isArray || function (val) {
      return !!val && '[object Array]' == str.call(val)
    }
  });
  // source: node_modules/is-number/index.js
  require.define('is-number', function (module, exports, __dirname, __filename, process) {
    /*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */
    'use strict';
    var typeOf = require('kind-of');
    module.exports = function isNumber(num) {
      var type = typeOf(num);
      if (type !== 'number' && type !== 'string') {
        return false
      }
      var n = +num;
      return n - n + 1 >= 0 && num !== ''
    }
  });
  // source: node_modules/kind-of/index.js
  require.define('kind-of', function (module, exports, __dirname, __filename, process) {
    var isBuffer = require('is-buffer');
    var toString = Object.prototype.toString;
    /**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */
    module.exports = function kindOf(val) {
      // primitivies
      if (typeof val === 'undefined') {
        return 'undefined'
      }
      if (val === null) {
        return 'null'
      }
      if (val === true || val === false || val instanceof Boolean) {
        return 'boolean'
      }
      if (typeof val === 'string' || val instanceof String) {
        return 'string'
      }
      if (typeof val === 'number' || val instanceof Number) {
        return 'number'
      }
      // functions
      if (typeof val === 'function' || val instanceof Function) {
        return 'function'
      }
      // array
      if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
        return 'array'
      }
      // check for instances of RegExp and Date before calling `toString`
      if (val instanceof RegExp) {
        return 'regexp'
      }
      if (val instanceof Date) {
        return 'date'
      }
      // other objects
      var type = toString.call(val);
      if (type === '[object RegExp]') {
        return 'regexp'
      }
      if (type === '[object Date]') {
        return 'date'
      }
      if (type === '[object Arguments]') {
        return 'arguments'
      }
      // buffer
      if (typeof Buffer !== 'undefined' && isBuffer(val)) {
        return 'buffer'
      }
      // es6: Map, WeakMap, Set, WeakSet
      if (type === '[object Set]') {
        return 'set'
      }
      if (type === '[object WeakSet]') {
        return 'weakset'
      }
      if (type === '[object Map]') {
        return 'map'
      }
      if (type === '[object WeakMap]') {
        return 'weakmap'
      }
      if (type === '[object Symbol]') {
        return 'symbol'
      }
      // typed arrays
      if (type === '[object Int8Array]') {
        return 'int8array'
      }
      if (type === '[object Uint8Array]') {
        return 'uint8array'
      }
      if (type === '[object Uint8ClampedArray]') {
        return 'uint8clampedarray'
      }
      if (type === '[object Int16Array]') {
        return 'int16array'
      }
      if (type === '[object Uint16Array]') {
        return 'uint16array'
      }
      if (type === '[object Int32Array]') {
        return 'int32array'
      }
      if (type === '[object Uint32Array]') {
        return 'uint32array'
      }
      if (type === '[object Float32Array]') {
        return 'float32array'
      }
      if (type === '[object Float64Array]') {
        return 'float64array'
      }
      // must be a plain object
      return 'object'
    }
  });
  // source: node_modules/is-buffer/index.js
  require.define('is-buffer', function (module, exports, __dirname, __filename, process) {
    /**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */
    module.exports = function (obj) {
      return !!(obj != null && (obj._isBuffer || obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)))
    }
  });
  // source: node_modules/is-object/index.js
  require.define('is-object', function (module, exports, __dirname, __filename, process) {
    'use strict';
    module.exports = function isObject(x) {
      return typeof x === 'object' && x !== null
    }
  });
  // source: node_modules/is-string/index.js
  require.define('is-string', function (module, exports, __dirname, __filename, process) {
    'use strict';
    var strValue = String.prototype.valueOf;
    var tryStringObject = function tryStringObject(value) {
      try {
        strValue.call(value);
        return true
      } catch (e) {
        return false
      }
    };
    var toStr = Object.prototype.toString;
    var strClass = '[object String]';
    var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
    module.exports = function isString(value) {
      if (typeof value === 'string') {
        return true
      }
      if (typeof value !== 'object') {
        return false
      }
      return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass
    }
  });
  // source: example/js/mediator.coffee
  require.define('./mediator', function (module, exports, __dirname, __filename, process) {
    var riot;
    riot = require('riot/riot');
    module.exports = riot.observable({})
  });
  // source: example/js/views/index.coffee
  require.define('./views', function (module, exports, __dirname, __filename, process) {
    module.exports = {
      Dashboard: require('./views/dashboard'),
      Login: require('./views/login'),
      register: function () {
        this.Dashboard.register();
        return this.Login.register()
      }
    }
  });
  // source: example/js/views/dashboard.coffee
  require.define('./views/dashboard', function (module, exports, __dirname, __filename, process) {
    var Daisho, Dashboard, View, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    View = require('crowdcontrol/lib').Views.View;
    Daisho = require('./Users/dtai/work/hanzo/daisho/src');
    module.exports = Dashboard = function (superClass) {
      extend(Dashboard, superClass);
      function Dashboard() {
        return Dashboard.__super__.constructor.apply(this, arguments)
      }
      Dashboard.prototype.tag = 'dashboard';
      Dashboard.prototype.html = require('./templates/dashboard');
      Dashboard.prototype.route = function (route) {
        return function () {
          return Daisho.route(route)
        }
      };
      return Dashboard
    }(View)
  });
  // source: node_modules/crowdcontrol/lib/index.js
  require.define('crowdcontrol/lib', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var CrowdControl, r, riot;
    r = require('crowdcontrol/lib/riot');
    riot = r();
    CrowdControl = {
      Views: require('crowdcontrol/lib/views'),
      tags: [],
      start: function (opts) {
        return this.tags = riot.mount('*', opts)
      },
      update: function () {
        var i, len, ref, results, tag;
        ref = this.tags;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          tag = ref[i];
          results.push(tag.update())
        }
        return results
      },
      riot: r
    };
    if (module.exports != null) {
      module.exports = CrowdControl
    }
    if (typeof window !== 'undefined' && window !== null) {
      if (window.Crowdstart != null) {
        window.Crowdstart.Crowdcontrol = CrowdControl
      } else {
        window.Crowdstart = { CrowdControl: CrowdControl }
      }
    }  //# sourceMappingURL=index.js.map
  });
  // source: node_modules/crowdcontrol/lib/riot.js
  require.define('crowdcontrol/lib/riot', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var r;
    r = function () {
      return this.riot
    };
    r.set = function (riot) {
      this.riot = riot
    };
    r.riot = typeof window !== 'undefined' && window !== null ? window.riot : void 0;
    module.exports = r  //# sourceMappingURL=riot.js.map
  });
  // source: node_modules/crowdcontrol/lib/views/index.js
  require.define('crowdcontrol/lib/views', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    module.exports = {
      Form: require('crowdcontrol/lib/views/form'),
      Input: require('crowdcontrol/lib/views/input'),
      View: require('crowdcontrol/lib/views/view')
    }  //# sourceMappingURL=index.js.map
  });
  // source: node_modules/crowdcontrol/lib/views/form.js
  require.define('crowdcontrol/lib/views/form', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Form, Promise, View, inputify, observable, settle, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    View = require('crowdcontrol/lib/views/view');
    inputify = require('crowdcontrol/lib/views/inputify');
    observable = require('crowdcontrol/lib/riot')().observable;
    Promise = require('broken/lib');
    settle = require('promise-settle');
    Form = function (superClass) {
      extend(Form, superClass);
      function Form() {
        return Form.__super__.constructor.apply(this, arguments)
      }
      Form.prototype.configs = null;
      Form.prototype.inputs = null;
      Form.prototype.data = null;
      Form.prototype.initInputs = function () {
        var input, name, ref, results1;
        this.inputs = {};
        if (this.configs != null) {
          this.inputs = inputify(this.data, this.configs);
          ref = this.inputs;
          results1 = [];
          for (name in ref) {
            input = ref[name];
            results1.push(observable(input))
          }
          return results1
        }
      };
      Form.prototype.init = function () {
        return this.initInputs()
      };
      Form.prototype.submit = function () {
        var input, name, pRef, ps, ref;
        ps = [];
        ref = this.inputs;
        for (name in ref) {
          input = ref[name];
          pRef = {};
          input.trigger('validate', pRef);
          ps.push(pRef.p)
        }
        return settle(ps).then(function (_this) {
          return function (results) {
            var i, len, result;
            for (i = 0, len = results.length; i < len; i++) {
              result = results[i];
              if (!result.isFulfilled()) {
                return
              }
            }
            return _this._submit.apply(_this, arguments)
          }
        }(this))
      };
      Form.prototype._submit = function () {
      };
      return Form
    }(View);
    module.exports = Form  //# sourceMappingURL=form.js.map
  });
  // source: node_modules/crowdcontrol/lib/views/view.js
  require.define('crowdcontrol/lib/views/view', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var View, collapsePrototype, isFunction, objectAssign, riot, setPrototypeOf;
    riot = require('crowdcontrol/lib/riot')();
    objectAssign = require('object-assign');
    setPrototypeOf = function () {
      var mixinProperties, setProtoOf;
      setProtoOf = function (obj, proto) {
        return obj.__proto__ = proto
      };
      mixinProperties = function (obj, proto) {
        var prop, results;
        results = [];
        for (prop in proto) {
          if (obj[prop] == null) {
            results.push(obj[prop] = proto[prop])
          } else {
            results.push(void 0)
          }
        }
        return results
      };
      if (Object.setPrototypeOf || { __proto__: [] } instanceof Array) {
        return setProtoOf
      } else {
        return mixinProperties
      }
    }();
    isFunction = require('is-function');
    collapsePrototype = function (collapse, proto) {
      var parentProto;
      if (proto === View.prototype) {
        return
      }
      parentProto = Object.getPrototypeOf(proto);
      collapsePrototype(collapse, parentProto);
      return objectAssign(collapse, parentProto)
    };
    View = function () {
      View.register = function () {
        return new this
      };
      View.prototype.tag = '';
      View.prototype.html = '';
      View.prototype.css = '';
      View.prototype.attrs = '';
      View.prototype.events = null;
      function View() {
        var newProto;
        newProto = collapsePrototype({}, this);
        this.beforeInit();
        riot.tag(this.tag, this.html, this.css, this.attrs, function (opts) {
          var fn, handler, k, name, parent, proto, ref, self, v;
          if (newProto != null) {
            for (k in newProto) {
              v = newProto[k];
              if (isFunction(v)) {
                (function (_this) {
                  return function (v) {
                    var oldFn;
                    if (_this[k] != null) {
                      oldFn = _this[k];
                      return _this[k] = function () {
                        oldFn.apply(_this, arguments);
                        return v.apply(_this, arguments)
                      }
                    } else {
                      return _this[k] = function () {
                        return v.apply(_this, arguments)
                      }
                    }
                  }
                }(this)(v))
              } else {
                this[k] = v
              }
            }
          }
          self = this;
          parent = self.parent;
          proto = Object.getPrototypeOf(self);
          while (parent != null && parent !== proto) {
            setPrototypeOf(self, parent);
            self = parent;
            parent = self.parent;
            proto = Object.getPrototypeOf(self)
          }
          if (opts != null) {
            for (k in opts) {
              v = opts[k];
              this[k] = v
            }
          }
          if (this.events != null) {
            ref = this.events;
            fn = function (_this) {
              return function (name, handler) {
                if (typeof handler === 'string') {
                  return _this.on(name, function () {
                    return _this[handler].apply(_this, arguments)
                  })
                } else {
                  return _this.on(name, function () {
                    return handler.apply(_this, arguments)
                  })
                }
              }
            }(this);
            for (name in ref) {
              handler = ref[name];
              fn(name, handler)
            }
          }
          return this.init(opts)
        })
      }
      View.prototype.beforeInit = function () {
      };
      View.prototype.init = function () {
      };
      return View
    }();
    module.exports = View  //# sourceMappingURL=view.js.map
  });
  // source: node_modules/object-assign/index.js
  require.define('object-assign', function (module, exports, __dirname, __filename, process) {
    /* eslint-disable no-unused-vars */
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === undefined) {
        throw new TypeError('Object.assign cannot be called with null or undefined')
      }
      return Object(val)
    }
    module.exports = Object.assign || function (target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key]
          }
        }
        if (Object.getOwnPropertySymbols) {
          symbols = Object.getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]]
            }
          }
        }
      }
      return to
    }
  });
  // source: node_modules/is-function/index.js
  require.define('is-function', function (module, exports, __dirname, __filename, process) {
    module.exports = isFunction;
    var toString = Object.prototype.toString;
    function isFunction(fn) {
      var string = toString.call(fn);
      return string === '[object Function]' || typeof fn === 'function' && string !== '[object RegExp]' || typeof window !== 'undefined' && (fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt)
    }
    ;
  });
  // source: node_modules/crowdcontrol/lib/views/inputify.js
  require.define('crowdcontrol/lib/views/inputify', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Promise, inputify, isFunction, isRef, refer;
    Promise = require('broken/lib');
    isFunction = require('is-function');
    refer = require('referential/lib');
    isRef = function (o) {
      return o != null && isFunction(o.ref)
    };
    inputify = function (data, configs) {
      var config, fn, inputs, name, ref;
      ref = data;
      if (!isRef(ref)) {
        ref = refer(data)
      }
      inputs = {};
      fn = function (name, config) {
        var fn1, i, input, len, middleware, middlewareFn, validate;
        middleware = [];
        if (config && config.length > 0) {
          fn1 = function (name, middlewareFn) {
            return middleware.push(function (pair) {
              ref = pair[0], name = pair[1];
              return Promise.resolve(pair).then(function (pair) {
                return middlewareFn.call(pair[0], pair[0].get(pair[1]), pair[1], pair[0])
              }).then(function (v) {
                ref.set(name, v);
                return pair
              })
            })
          };
          for (i = 0, len = config.length; i < len; i++) {
            middlewareFn = config[i];
            fn1(name, middlewareFn)
          }
        }
        middleware.push(function (pair) {
          ref = pair[0], name = pair[1];
          return Promise.resolve(ref.get(name))
        });
        validate = function (ref, name) {
          var j, len1, p;
          p = Promise.resolve([
            ref,
            name
          ]);
          for (j = 0, len1 = middleware.length; j < len1; j++) {
            middlewareFn = middleware[j];
            p = p.then(middlewareFn)
          }
          return p
        };
        input = {
          name: name,
          ref: ref,
          config: config,
          validate: validate
        };
        return inputs[name] = input
      };
      for (name in configs) {
        config = configs[name];
        fn(name, config)
      }
      return inputs
    };
    module.exports = inputify  //# sourceMappingURL=inputify.js.map
  });
  // source: node_modules/broken/lib/index.js
  require.define('broken/lib', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Promise, PromiseInspection;
    Promise = require('zousan/zousan-min');
    Promise.suppressUncaughtRejectionError = false;
    PromiseInspection = function () {
      function PromiseInspection(arg) {
        this.state = arg.state, this.value = arg.value, this.reason = arg.reason
      }
      PromiseInspection.prototype.isFulfilled = function () {
        return this.state === 'fulfilled'
      };
      PromiseInspection.prototype.isRejected = function () {
        return this.state === 'rejected'
      };
      return PromiseInspection
    }();
    Promise.reflect = function (promise) {
      return new Promise(function (resolve, reject) {
        return promise.then(function (value) {
          return resolve(new PromiseInspection({
            state: 'fulfilled',
            value: value
          }))
        })['catch'](function (err) {
          return resolve(new PromiseInspection({
            state: 'rejected',
            reason: err
          }))
        })
      })
    };
    Promise.settle = function (promises) {
      return Promise.all(promises.map(Promise.reflect))
    };
    Promise.prototype.callback = function (cb) {
      if (typeof cb === 'function') {
        this.then(function (value) {
          return cb(null, value)
        });
        this['catch'](function (error) {
          return cb(error, null)
        })
      }
      return this
    };
    module.exports = Promise  //# sourceMappingURL=index.js.map
  });
  // source: node_modules/zousan/zousan-min.js
  require.define('zousan/zousan-min', function (module, exports, __dirname, __filename, process) {
    !function (t) {
      'use strict';
      function e(t) {
        if (t) {
          var e = this;
          t(function (t) {
            e.resolve(t)
          }, function (t) {
            e.reject(t)
          })
        }
      }
      function n(t, e) {
        if ('function' == typeof t.y)
          try {
            var n = t.y.call(i, e);
            t.p.resolve(n)
          } catch (o) {
            t.p.reject(o)
          }
        else
          t.p.resolve(e)
      }
      function o(t, e) {
        if ('function' == typeof t.n)
          try {
            var n = t.n.call(i, e);
            t.p.resolve(n)
          } catch (o) {
            t.p.reject(o)
          }
        else
          t.p.reject(e)
      }
      var r, i, c = 'fulfilled', u = 'rejected', s = 'undefined', f = function () {
          function t() {
            for (; e.length - n;)
              e[n](), e[n++] = i, n == o && (e.splice(0, o), n = 0)
          }
          var e = [], n = 0, o = 1024, r = function () {
              if (typeof MutationObserver !== s) {
                var e = document.createElement('div'), n = new MutationObserver(t);
                return n.observe(e, { attributes: !0 }), function () {
                  e.setAttribute('a', 0)
                }
              }
              return typeof setImmediate !== s ? function () {
                setImmediate(t)
              } : function () {
                setTimeout(t, 0)
              }
            }();
          return function (t) {
            e.push(t), e.length - n == 1 && r()
          }
        }();
      e.prototype = {
        resolve: function (t) {
          if (this.state === r) {
            if (t === this)
              return this.reject(new TypeError('Attempt to resolve promise with self'));
            var e = this;
            if (t && ('function' == typeof t || 'object' == typeof t))
              try {
                var o = !0, i = t.then;
                if ('function' == typeof i)
                  return void i.call(t, function (t) {
                    o && (o = !1, e.resolve(t))
                  }, function (t) {
                    o && (o = !1, e.reject(t))
                  })
              } catch (u) {
                return void (o && this.reject(u))
              }
            this.state = c, this.v = t, e.c && f(function () {
              for (var o = 0, r = e.c.length; r > o; o++)
                n(e.c[o], t)
            })
          }
        },
        reject: function (t) {
          if (this.state === r) {
            this.state = u, this.v = t;
            var n = this.c;
            n ? f(function () {
              for (var e = 0, r = n.length; r > e; e++)
                o(n[e], t)
            }) : e.suppressUncaughtRejectionError || console.log('You upset Zousan. Please catch rejections: ', t, t.stack)
          }
        },
        then: function (t, i) {
          var u = new e, s = {
              y: t,
              n: i,
              p: u
            };
          if (this.state === r)
            this.c ? this.c.push(s) : this.c = [s];
          else {
            var l = this.state, a = this.v;
            f(function () {
              l === c ? n(s, a) : o(s, a)
            })
          }
          return u
        },
        'catch': function (t) {
          return this.then(null, t)
        },
        'finally': function (t) {
          return this.then(t, t)
        },
        timeout: function (t, n) {
          n = n || 'Timeout';
          var o = this;
          return new e(function (e, r) {
            setTimeout(function () {
              r(Error(n))
            }, t), o.then(function (t) {
              e(t)
            }, function (t) {
              r(t)
            })
          })
        }
      }, e.resolve = function (t) {
        var n = new e;
        return n.resolve(t), n
      }, e.reject = function (t) {
        var n = new e;
        return n.reject(t), n
      }, e.all = function (t) {
        function n(n, c) {
          'function' != typeof n.then && (n = e.resolve(n)), n.then(function (e) {
            o[c] = e, r++, r == t.length && i.resolve(o)
          }, function (t) {
            i.reject(t)
          })
        }
        for (var o = [], r = 0, i = new e, c = 0; c < t.length; c++)
          n(t[c], c);
        return t.length || i.resolve(o), i
      }, typeof module != s && module.exports && (module.exports = e), t.Zousan = e, e.soon = f
    }('undefined' != typeof global ? global : this)
  });
  // source: node_modules/promise-settle/index.js
  require.define('promise-settle', function (module, exports, __dirname, __filename, process) {
    'use strict';
    module.exports = require('promise-settle/lib/promise-settle')
  });
  // source: node_modules/promise-settle/lib/promise-settle.js
  require.define('promise-settle/lib/promise-settle', function (module, exports, __dirname, __filename, process) {
    'use strict';
    module.exports = settle;
    function settle(promises) {
      return Promise.resolve().then(function () {
        return promises
      }).then(function (promises) {
        if (!Array.isArray(promises))
          throw new TypeError('Expected an array of Promises');
        var promiseResults = promises.map(function (promise) {
          return Promise.resolve().then(function () {
            return promise
          }).then(function (result) {
            return promiseResult(result)
          }).catch(function (err) {
            return promiseResult(null, err)
          })
        });
        return Promise.all(promiseResults)
      })
    }
    function promiseResult(result, err) {
      var isFulfilled = typeof err === 'undefined';
      var value = isFulfilled ? returns.bind(result) : throws.bind(new Error('Promise is rejected'));
      var isRejected = !isFulfilled;
      var reason = isRejected ? returns.bind(err) : throws.bind(new Error('Promise is fulfilled'));
      return {
        isFulfilled: returns.bind(isFulfilled),
        isRejected: returns.bind(isRejected),
        value: value,
        reason: reason
      }
    }
    function returns() {
      return this
    }
    function throws() {
      throw this
    }
  });
  // source: node_modules/crowdcontrol/lib/views/input.js
  require.define('crowdcontrol/lib/views/input', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Input, View, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    View = require('crowdcontrol/lib/views/view');
    Input = function (superClass) {
      extend(Input, superClass);
      function Input() {
        return Input.__super__.constructor.apply(this, arguments)
      }
      Input.prototype.input = null;
      Input.prototype.errorMessage = '';
      Input.prototype.errorHtml = '<div class="error-container" if="{ errorMessage }">\n  <div class="error-message">{ errorMessage }</div>\n</div>';
      Input.prototype.beforeInit = function () {
        return this.html += this.errorHtml
      };
      Input.prototype.init = function () {
        return this.input.on('validate', function (_this) {
          return function (pRef) {
            return _this.validate(pRef)
          }
        }(this))
      };
      Input.prototype.getValue = function (event) {
        return event.target.value
      };
      Input.prototype.change = function (event) {
        var name, ref, ref1, value;
        ref1 = this.input, ref = ref1.ref, name = ref1.name;
        value = this.getValue(event);
        if (value === ref.get(name)) {
          return
        }
        this.input.ref.set(name, value);
        this.clearError();
        return this.validate()
      };
      Input.prototype.error = function (err) {
        var ref1;
        return this.errorMessage = (ref1 = err != null ? err.message : void 0) != null ? ref1 : err
      };
      Input.prototype.changed = function () {
      };
      Input.prototype.clearError = function () {
        return this.errorMessage = ''
      };
      Input.prototype.validate = function (pRef) {
        var p;
        p = this.input.validate(this.input.ref, this.input.name).then(function (_this) {
          return function (value) {
            _this.changed(value);
            return _this.update()
          }
        }(this))['catch'](function (_this) {
          return function (err) {
            _this.error(err);
            _this.update();
            throw err
          }
        }(this));
        if (pRef != null) {
          pRef.p = p
        }
        return p
      };
      return Input
    }(View);
    module.exports = Input  //# sourceMappingURL=input.js.map
  });
  // source: src/index.coffee
  require.define('./Users/dtai/work/hanzo/daisho/src', function (module, exports, __dirname, __filename, process) {
    var Promise, Xhr, exports, page;
    Promise = require('broken/lib');
    Xhr = require('xhr-promise-es6/lib');
    Xhr.Promise = Promise;
    page = require('page');
    require.urlFor = function (file) {
      return '/example/fixtures/' + file
    };
    exports = {
      basePath: '',
      moduleDefinitions: [],
      modulesRequired: [],
      modules: {},
      moduleList: [],
      renderElement: null,
      started: false,
      init: function (basePath, modulesUrl) {
        var opts;
        this.basePath = basePath;
        this.modulesUrl = modulesUrl;
        page.base(this.basePath);
        opts = {
          url: this.modulesUrl,
          method: 'GET'
        };
        return new Xhr().send(opts).then(function (_this) {
          return function (res) {
            _this.moduleDefinitions = res.responseText;
            return _this.moduleDefinitions
          }
        }(this))['catch'](function (res) {
          return console.log('ERROR:', res)
        })
      },
      setRenderElement: function (renderElement) {
        this.renderElement = renderElement
      },
      load: function (modulesRequired, defaultModule) {
        this.modulesRequired = modulesRequired;
        this.defaultModule = defaultModule;
        return new Promise(function (_this) {
          return function (resolve, reject) {
            var fn, i, len, module, moduleList, moduleRequired, modules, ref, timeoutId, waits;
            timeoutId = setTimeout(function () {
              return reject(new Error('Loading Timed Out'))
            }, 10000);
            waits = 0;
            _this.modules = modules = {};
            _this.moduleList = moduleList = [];
            ref = _this.modulesRequired;
            fn = function (module, modules, moduleList) {
              var m;
              m = {};
              m.definition = module;
              moduleList.push(m);
              modules[module.name] = m;
              return function (m) {
                require(module.name + '-v' + module.version + '/bundle.js', function (js) {
                  var fn1, p, r, ref1;
                  m.name = js.name;
                  m.js = js;
                  m.key = module.name;
                  waits--;
                  clearTimeout(timeoutId);
                  ref1 = js.prototype.routes;
                  fn1 = function (r, p) {
                    return page('/' + module.name + r, function () {
                      var moduleInstance, ref2, ref3;
                      moduleInstance = new js;
                      if (_this.activeModuleInstance !== moduleInstance) {
                        if ((ref2 = _this.activeModuleInstance) != null ? ref2.unload : void 0) {
                          _this.activeModuleInstance.unload()
                        }
                        _this.activeModuleInstance = moduleInstance;
                        _this.activeModuleInstance.load()
                      }
                      if ((ref3 = _this.activePageInstance) != null ? ref3.unload : void 0) {
                        _this.activePageInstance.unload();
                        while (_this.renderElement.firstChild != null) {
                          _this.renderElement.removeChild(_this.renderElement.firstChild)
                        }
                      }
                      _this.activePageInstance = new p(_this.renderElement, _this.activeModuleInstance);
                      _this.activePageInstance.load();
                      return _this.activePageInstance.render()
                    })
                  };
                  for (r in ref1) {
                    p = ref1[r];
                    if (r === '/') {
                      r = ''
                    }
                    fn1(r, p)
                  }
                  if (waits === 0) {
                    return resolve({
                      modules: _this.modules,
                      moduleList: _this.moduleList
                    })
                  }
                });
                return m.css = module.name + '-v' + module.version + '/bundle.css'
              }(m)
            };
            for (i = 0, len = ref.length; i < len; i++) {
              moduleRequired = ref[i];
              module = _this._getModule(moduleRequired);
              waits++;
              fn(module, modules, moduleList)
            }
            if (waits === 0) {
              return p.resolve({
                modules: _this.modules,
                moduleList: _this.moduleList
              })
            }
          }
        }(this))
      },
      route: function (route) {
        if (!this.started) {
          this.started = true;
          page()
        }
        return page(this.basePath + '/' + route)
      },
      _getModule: function (moduleName) {
        var i, len, module, ref;
        ref = this.moduleDefinitions;
        for (i = 0, len = ref.length; i < len; i++) {
          module = ref[i];
          if (moduleName === module.name) {
            return module
          }
        }
      }
    };
    if (typeof window !== 'undefined' && window !== null) {
      window.Daisho = exports
    }
    module.exports = exports
  });
  // source: node_modules/xhr-promise-es6/lib/index.js
  require.define('xhr-promise-es6/lib', function (module, exports, __dirname, __filename, process) {
    /*
 * Copyright 2015 Scott Brady
 * MIT License
 * https://github.com/scottbrady/xhr-promise/blob/master/LICENSE
 */
    var ParseHeaders, XMLHttpRequestPromise, objectAssign;
    ParseHeaders = require('parse-headers/parse-headers');
    objectAssign = require('object-assign');
    /*
 * Module to wrap an XMLHttpRequest in a promise.
 */
    module.exports = XMLHttpRequestPromise = function () {
      function XMLHttpRequestPromise() {
      }
      XMLHttpRequestPromise.DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';
      XMLHttpRequestPromise.Promise = global.Promise;
      /*
   * XMLHttpRequestPromise.send(options) -> Promise
   * - options (Object): URL, method, data, etc.
   *
   * Create the XHR object and wire up event handlers to use a promise.
   */
      XMLHttpRequestPromise.prototype.send = function (options) {
        var defaults;
        if (options == null) {
          options = {}
        }
        defaults = {
          method: 'GET',
          data: null,
          headers: {},
          async: true,
          username: null,
          password: null
        };
        options = objectAssign({}, defaults, options);
        return new this.constructor.Promise(function (_this) {
          return function (resolve, reject) {
            var e, header, ref, value, xhr;
            if (!XMLHttpRequest) {
              _this._handleError('browser', reject, null, "browser doesn't support XMLHttpRequest");
              return
            }
            if (typeof options.url !== 'string' || options.url.length === 0) {
              _this._handleError('url', reject, null, 'URL is a required parameter');
              return
            }
            _this._xhr = xhr = new XMLHttpRequest;
            xhr.onload = function () {
              var responseText;
              _this._detachWindowUnload();
              try {
                responseText = _this._getResponseText()
              } catch (_error) {
                _this._handleError('parse', reject, null, 'invalid JSON response');
                return
              }
              return resolve({
                url: _this._getResponseUrl(),
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: responseText,
                headers: _this._getHeaders(),
                xhr: xhr
              })
            };
            xhr.onerror = function () {
              return _this._handleError('error', reject)
            };
            xhr.ontimeout = function () {
              return _this._handleError('timeout', reject)
            };
            xhr.onabort = function () {
              return _this._handleError('abort', reject)
            };
            _this._attachWindowUnload();
            xhr.open(options.method, options.url, options.async, options.username, options.password);
            if (options.data != null && !options.headers['Content-Type']) {
              options.headers['Content-Type'] = _this.constructor.DEFAULT_CONTENT_TYPE
            }
            ref = options.headers;
            for (header in ref) {
              value = ref[header];
              xhr.setRequestHeader(header, value)
            }
            try {
              return xhr.send(options.data)
            } catch (_error) {
              e = _error;
              return _this._handleError('send', reject, null, e.toString())
            }
          }
        }(this))
      };
      /*
   * XMLHttpRequestPromise.getXHR() -> XMLHttpRequest
   */
      XMLHttpRequestPromise.prototype.getXHR = function () {
        return this._xhr
      };
      /*
   * XMLHttpRequestPromise._attachWindowUnload()
   *
   * Fix for IE 9 and IE 10
   * Internet Explorer freezes when you close a webpage during an XHR request
   * https://support.microsoft.com/kb/2856746
   *
   */
      XMLHttpRequestPromise.prototype._attachWindowUnload = function () {
        this._unloadHandler = this._handleWindowUnload.bind(this);
        if (window.attachEvent) {
          return window.attachEvent('onunload', this._unloadHandler)
        }
      };
      /*
   * XMLHttpRequestPromise._detachWindowUnload()
   */
      XMLHttpRequestPromise.prototype._detachWindowUnload = function () {
        if (window.detachEvent) {
          return window.detachEvent('onunload', this._unloadHandler)
        }
      };
      /*
   * XMLHttpRequestPromise._getHeaders() -> Object
   */
      XMLHttpRequestPromise.prototype._getHeaders = function () {
        return ParseHeaders(this._xhr.getAllResponseHeaders())
      };
      /*
   * XMLHttpRequestPromise._getResponseText() -> Mixed
   *
   * Parses response text JSON if present.
   */
      XMLHttpRequestPromise.prototype._getResponseText = function () {
        var responseText;
        responseText = typeof this._xhr.responseText === 'string' ? this._xhr.responseText : '';
        switch (this._xhr.getResponseHeader('Content-Type')) {
        case 'application/json':
        case 'text/javascript':
          responseText = JSON.parse(responseText + '')
        }
        return responseText
      };
      /*
   * XMLHttpRequestPromise._getResponseUrl() -> String
   *
   * Actual response URL after following redirects.
   */
      XMLHttpRequestPromise.prototype._getResponseUrl = function () {
        if (this._xhr.responseURL != null) {
          return this._xhr.responseURL
        }
        if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
          return this._xhr.getResponseHeader('X-Request-URL')
        }
        return ''
      };
      /*
   * XMLHttpRequestPromise._handleError(reason, reject, status, statusText)
   * - reason (String)
   * - reject (Function)
   * - status (String)
   * - statusText (String)
   */
      XMLHttpRequestPromise.prototype._handleError = function (reason, reject, status, statusText) {
        this._detachWindowUnload();
        return reject({
          reason: reason,
          status: status || this._xhr.status,
          statusText: statusText || this._xhr.statusText,
          xhr: this._xhr
        })
      };
      /*
   * XMLHttpRequestPromise._handleWindowUnload()
   */
      XMLHttpRequestPromise.prototype._handleWindowUnload = function () {
        return this._xhr.abort()
      };
      return XMLHttpRequestPromise
    }()
  });
  // source: node_modules/parse-headers/parse-headers.js
  require.define('parse-headers/parse-headers', function (module, exports, __dirname, __filename, process) {
    var trim = require('trim'), forEach = require('for-each'), isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]'
      };
    module.exports = function (headers) {
      if (!headers)
        return {};
      var result = {};
      forEach(trim(headers).split('\n'), function (row) {
        var index = row.indexOf(':'), key = trim(row.slice(0, index)).toLowerCase(), value = trim(row.slice(index + 1));
        if (typeof result[key] === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [
            result[key],
            value
          ]
        }
      });
      return result
    }
  });
  // source: node_modules/trim/index.js
  require.define('trim', function (module, exports, __dirname, __filename, process) {
    exports = module.exports = trim;
    function trim(str) {
      return str.replace(/^\s*|\s*$/g, '')
    }
    exports.left = function (str) {
      return str.replace(/^\s*/, '')
    };
    exports.right = function (str) {
      return str.replace(/\s*$/, '')
    }
  });
  // source: node_modules/for-each/index.js
  require.define('for-each', function (module, exports, __dirname, __filename, process) {
    var isFunction = require('is-function');
    module.exports = forEach;
    var toString = Object.prototype.toString;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function forEach(list, iterator, context) {
      if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
      }
      if (arguments.length < 3) {
        context = this
      }
      if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context);
      else if (typeof list === 'string')
        forEachString(list, iterator, context);
      else
        forEachObject(list, iterator, context)
    }
    function forEachArray(array, iterator, context) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
          iterator.call(context, array[i], i, array)
        }
      }
    }
    function forEachString(string, iterator, context) {
      for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
      }
    }
    function forEachObject(object, iterator, context) {
      for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
          iterator.call(context, object[k], k, object)
        }
      }
    }
  });
  // source: node_modules/page/index.js
  require.define('page', function (module, exports, __dirname, __filename, process) {
    /* globals require, module */
    'use strict';
    /**
   * Module dependencies.
   */
    var pathtoRegexp = require('path-to-regexp');
    /**
   * Module exports.
   */
    module.exports = page;
    /**
   * Detect click event
   */
    var clickEvent = 'undefined' !== typeof document && document.ontouchstart ? 'touchstart' : 'click';
    /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */
    var location = 'undefined' !== typeof window && (window.history.location || window.location);
    /**
   * Perform initial dispatch.
   */
    var dispatch = true;
    /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
    var decodeURLComponents = true;
    /**
   * Base path.
   */
    var base = '';
    /**
   * Running flag.
   */
    var running;
    /**
   * HashBang option
   */
    var hashbang = false;
    /**
   * Previous context, for capturing
   * page exit events.
   */
    var prevContext;
    /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {string|!Function|!Object} path
   * @param {Function=} fn
   * @api public
   */
    function page(path, fn) {
      // <callback>
      if ('function' === typeof path) {
        return page('*', path)
      }
      // route <path> to <callback ...>
      if ('function' === typeof fn) {
        var route = new Route(path);
        for (var i = 1; i < arguments.length; ++i) {
          page.callbacks.push(route.middleware(arguments[i]))
        }  // show <path> with [state]
      } else if ('string' === typeof path) {
        page['string' === typeof fn ? 'redirect' : 'show'](path, fn)  // start [options]
      } else {
        page.start(path)
      }
    }
    /**
   * Callback functions.
   */
    page.callbacks = [];
    page.exits = [];
    /**
   * Current path being processed
   * @type {string}
   */
    page.current = '';
    /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */
    page.len = 0;
    /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */
    page.base = function (path) {
      if (0 === arguments.length)
        return base;
      base = path
    };
    /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */
    page.start = function (options) {
      options = options || {};
      if (running)
        return;
      running = true;
      if (false === options.dispatch)
        dispatch = false;
      if (false === options.decodeURLComponents)
        decodeURLComponents = false;
      if (false !== options.popstate)
        window.addEventListener('popstate', onpopstate, false);
      if (false !== options.click) {
        document.addEventListener(clickEvent, onclick, false)
      }
      if (true === options.hashbang)
        hashbang = true;
      if (!dispatch)
        return;
      var url = hashbang && ~location.hash.indexOf('#!') ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
      page.replace(url, null, true, dispatch)
    };
    /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */
    page.stop = function () {
      if (!running)
        return;
      page.current = '';
      page.len = 0;
      running = false;
      document.removeEventListener(clickEvent, onclick, false);
      window.removeEventListener('popstate', onpopstate, false)
    };
    /**
   * Show `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} dispatch
   * @param {boolean=} push
   * @return {!Context}
   * @api public
   */
    page.show = function (path, state, dispatch, push) {
      var ctx = new Context(path, state);
      page.current = ctx.path;
      if (false !== dispatch)
        page.dispatch(ctx);
      if (false !== ctx.handled && false !== push)
        ctx.pushState();
      return ctx
    };
    /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object=} state
   * @api public
   */
    page.back = function (path, state) {
      if (page.len > 0) {
        // this may need more testing to see if all browsers
        // wait for the next tick to go back in history
        history.back();
        page.len--
      } else if (path) {
        setTimeout(function () {
          page.show(path, state)
        })
      } else {
        setTimeout(function () {
          page.show(base, state)
        })
      }
    };
    /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {string} from - if param 'to' is undefined redirects to 'from'
   * @param {string=} to
   * @api public
   */
    page.redirect = function (from, to) {
      // Define route from a path to another
      if ('string' === typeof from && 'string' === typeof to) {
        page(from, function (e) {
          setTimeout(function () {
            page.replace(to)
          }, 0)
        })
      }
      // Wait for the push state and replace it with another
      if ('string' === typeof from && 'undefined' === typeof to) {
        setTimeout(function () {
          page.replace(from)
        }, 0)
      }
    };
    /**
   * Replace `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} init
   * @param {boolean=} dispatch
   * @return {!Context}
   * @api public
   */
    page.replace = function (path, state, init, dispatch) {
      var ctx = new Context(path, state);
      page.current = ctx.path;
      ctx.init = init;
      ctx.save();
      // save before dispatching, which may redirect
      if (false !== dispatch)
        page.dispatch(ctx);
      return ctx
    };
    /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */
    page.dispatch = function (ctx) {
      var prev = prevContext, i = 0, j = 0;
      prevContext = ctx;
      function nextExit() {
        var fn = page.exits[j++];
        if (!fn)
          return nextEnter();
        fn(prev, nextExit)
      }
      function nextEnter() {
        var fn = page.callbacks[i++];
        if (ctx.path !== page.current) {
          ctx.handled = false;
          return
        }
        if (!fn)
          return unhandled(ctx);
        fn(ctx, nextEnter)
      }
      if (prev) {
        nextExit()
      } else {
        nextEnter()
      }
    };
    /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */
    function unhandled(ctx) {
      if (ctx.handled)
        return;
      var current;
      if (hashbang) {
        current = base + location.hash.replace('#!', '')
      } else {
        current = location.pathname + location.search
      }
      if (current === ctx.canonicalPath)
        return;
      page.stop();
      ctx.handled = false;
      location.href = ctx.canonicalPath
    }
    /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
    page.exit = function (path, fn) {
      if (typeof path === 'function') {
        return page.exit('*', path)
      }
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.exits.push(route.middleware(arguments[i]))
      }
    };
    /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   */
    function decodeURLEncodedURIComponent(val) {
      if (typeof val !== 'string') {
        return val
      }
      return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val
    }
    /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @constructor
   * @param {string} path
   * @param {Object=} state
   * @api public
   */
    function Context(path, state) {
      if ('/' === path[0] && 0 !== path.indexOf(base))
        path = base + (hashbang ? '#!' : '') + path;
      var i = path.indexOf('?');
      this.canonicalPath = path;
      this.path = path.replace(base, '') || '/';
      if (hashbang)
        this.path = this.path.replace('#!', '') || '/';
      this.title = document.title;
      this.state = state || {};
      this.state.path = path;
      this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
      this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
      this.params = {};
      // fragment
      this.hash = '';
      if (!hashbang) {
        if (!~this.path.indexOf('#'))
          return;
        var parts = this.path.split('#');
        this.path = parts[0];
        this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
        this.querystring = this.querystring.split('#')[0]
      }
    }
    /**
   * Expose `Context`.
   */
    page.Context = Context;
    /**
   * Push state.
   *
   * @api private
   */
    Context.prototype.pushState = function () {
      page.len++;
      history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath)
    };
    /**
   * Save the context state.
   *
   * @api public
   */
    Context.prototype.save = function () {
      history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath)
    };
    /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @constructor
   * @param {string} path
   * @param {Object=} options
   * @api private
   */
    function Route(path, options) {
      options = options || {};
      this.path = path === '*' ? '(.*)' : path;
      this.method = 'GET';
      this.regexp = pathtoRegexp(this.path, this.keys = [], options)
    }
    /**
   * Expose `Route`.
   */
    page.Route = Route;
    /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */
    Route.prototype.middleware = function (fn) {
      var self = this;
      return function (ctx, next) {
        if (self.match(ctx.path, ctx.params))
          return fn(ctx, next);
        next()
      }
    };
    /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {string} path
   * @param {Object} params
   * @return {boolean}
   * @api private
   */
    Route.prototype.match = function (path, params) {
      var keys = this.keys, qsIndex = path.indexOf('?'), pathname = ~qsIndex ? path.slice(0, qsIndex) : path, m = this.regexp.exec(decodeURIComponent(pathname));
      if (!m)
        return false;
      for (var i = 1, len = m.length; i < len; ++i) {
        var key = keys[i - 1];
        var val = decodeURLEncodedURIComponent(m[i]);
        if (val !== undefined || !hasOwnProperty.call(params, key.name)) {
          params[key.name] = val
        }
      }
      return true
    };
    /**
   * Handle "populate" events.
   */
    var onpopstate = function () {
      var loaded = false;
      if ('undefined' === typeof window) {
        return
      }
      if (document.readyState === 'complete') {
        loaded = true
      } else {
        window.addEventListener('load', function () {
          setTimeout(function () {
            loaded = true
          }, 0)
        })
      }
      return function onpopstate(e) {
        if (!loaded)
          return;
        if (e.state) {
          var path = e.state.path;
          page.replace(path, e.state)
        } else {
          page.show(location.pathname + location.hash, undefined, undefined, false)
        }
      }
    }();
    /**
   * Handle "click" events.
   */
    function onclick(e) {
      if (1 !== which(e))
        return;
      if (e.metaKey || e.ctrlKey || e.shiftKey)
        return;
      if (e.defaultPrevented)
        return;
      // ensure link
      var el = e.target;
      while (el && 'A' !== el.nodeName)
        el = el.parentNode;
      if (!el || 'A' !== el.nodeName)
        return;
      // Ignore if tag has
      // 1. "download" attribute
      // 2. rel="external" attribute
      if (el.hasAttribute('download') || el.getAttribute('rel') === 'external')
        return;
      // ensure non-hash for the same path
      var link = el.getAttribute('href');
      if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link))
        return;
      // Check for mailto: in the href
      if (link && link.indexOf('mailto:') > -1)
        return;
      // check target
      if (el.target)
        return;
      // x-origin
      if (!sameOrigin(el.href))
        return;
      // rebuild path
      var path = el.pathname + el.search + (el.hash || '');
      // strip leading "/[drive letter]:" on NW.js on Windows
      if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
        path = path.replace(/^\/[a-zA-Z]:\//, '/')
      }
      // same page
      var orig = path;
      if (path.indexOf(base) === 0) {
        path = path.substr(base.length)
      }
      if (hashbang)
        path = path.replace('#!', '');
      if (base && orig === path)
        return;
      e.preventDefault();
      page.show(orig)
    }
    /**
   * Event button.
   */
    function which(e) {
      e = e || window.event;
      return null === e.which ? e.button : e.which
    }
    /**
   * Check if `href` is the same origin.
   */
    function sameOrigin(href) {
      var origin = location.protocol + '//' + location.hostname;
      if (location.port)
        origin += ':' + location.port;
      return href && 0 === href.indexOf(origin)
    }
    page.sameOrigin = sameOrigin
  });
  // source: node_modules/path-to-regexp/index.js
  require.define('path-to-regexp', function (module, exports, __dirname, __filename, process) {
    var isarray = require('isarray');
    /**
 * Expose `pathToRegexp`.
 */
    module.exports = pathToRegexp;
    module.exports.parse = parse;
    module.exports.compile = compile;
    module.exports.tokensToFunction = tokensToFunction;
    module.exports.tokensToRegExp = tokensToRegExp;
    /**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');
    /**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
    function parse(str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;
      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;
        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }
        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = ''
        }
        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];
        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');
        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        })
      }
      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index)
      }
      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path)
      }
      return tokens
    }
    /**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
    function compile(str) {
      return tokensToFunction(parse(str))
    }
    /**
 * Expose a method for transforming tokens into the path function.
 */
    function tokensToFunction(tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);
      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$')
        }
      }
      return function (obj) {
        var path = '';
        var data = obj || {};
        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];
          if (typeof token === 'string') {
            path += token;
            continue
          }
          var value = data[token.name];
          var segment;
          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }
          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }
            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }
            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);
              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }
              path += (j === 0 ? token.prefix : token.delimiter) + segment
            }
            continue
          }
          segment = encodeURIComponent(value);
          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }
          path += token.prefix + segment
        }
        return path
      }
    }
    /**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
    function escapeString(str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }
    /**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
    function escapeGroup(group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }
    /**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
    function attachKeys(re, keys) {
      re.keys = keys;
      return re
    }
    /**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
    function flags(options) {
      return options.sensitive ? '' : 'i'
    }
    /**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
    function regexpToRegexp(path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);
      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          })
        }
      }
      return attachKeys(path, keys)
    }
    /**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
    function arrayToRegexp(path, keys, options) {
      var parts = [];
      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source)
      }
      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
      return attachKeys(regexp, keys)
    }
    /**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
    function stringToRegexp(path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);
      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i])
        }
      }
      return attachKeys(re, keys)
    }
    /**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
    function tokensToRegExp(tokens, options) {
      options = options || {};
      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);
      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (typeof token === 'string') {
          route += escapeString(token)
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;
          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*'
          }
          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?'
            } else {
              capture = '(' + capture + ')?'
            }
          } else {
            capture = prefix + '(' + capture + ')'
          }
          route += capture
        }
      }
      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
      }
      if (end) {
        route += '$'
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)'
      }
      return new RegExp('^' + route, flags(options))
    }
    /**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
    function pathToRegexp(path, keys, options) {
      keys = keys || [];
      if (!isarray(keys)) {
        options = keys;
        keys = []
      } else if (!options) {
        options = {}
      }
      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys, options)
      }
      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }
      return stringToRegexp(path, keys, options)
    }
  });
  // source: node_modules/isarray/index.js
  require.define('isarray', function (module, exports, __dirname, __filename, process) {
    module.exports = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]'
    }
  });
  // source: example/js/templates/dashboard.html
  require.define('./templates/dashboard', function (module, exports, __dirname, __filename, process) {
    module.exports = '<header>HEADER</header>\n\n<nav>\n  <span>NAVIGATION</span>\n  <ul>\n    <li each="{ m in moduleList }" onclick="{ route(m.key) }">{ m.name }</li>\n  </ul>\n</nav>\n\n<section>\n</section>\n\n<footer>FOOTER</footer>\n\n'
  });
  // source: example/js/views/login.coffee
  require.define('./views/login', function (module, exports, __dirname, __filename, process) {
    var CrowdControl, Events, LoginForm, isEmail, isPassword, isRequired, m, ref, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    CrowdControl = require('crowdcontrol/lib');
    ref = require('./views/middleware'), isRequired = ref.isRequired, isEmail = ref.isEmail, isPassword = ref.isPassword;
    m = require('./mediator');
    Events = require('./events');
    module.exports = LoginForm = function (superClass) {
      extend(LoginForm, superClass);
      function LoginForm() {
        return LoginForm.__super__.constructor.apply(this, arguments)
      }
      LoginForm.prototype.tag = 'login';
      LoginForm.prototype.html = require('./templates/login');
      LoginForm.prototype.configs = {
        'email': [
          isRequired,
          isEmail
        ],
        'password': [isPassword],
        'organization': [isRequired]
      };
      LoginForm.prototype.errorMessage = null;
      LoginForm.prototype._submit = function (event) {
        var opts;
        opts = {
          username: this.data.get('email'),
          password: this.data.get('password'),
          client_id: this.data.get('organization'),
          grant_type: 'password'
        };
        this.errorMessage = null;
        m.trigger(Events.Login);
        return this.client.oauth.auth(opts).then(function (_this) {
          return function (res) {
            m.trigger(Events.LoginSuccess, res);
            return _this.update()
          }
        }(this))['catch'](function (_this) {
          return function (err) {
            _this.errorMessage = err.message;
            m.trigger(Events.LoginFailed, err);
            return _this.update()
          }
        }(this))
      };
      return LoginForm
    }(CrowdControl.Views.Form)
  });
  // source: example/js/views/middleware.coffee
  require.define('./views/middleware', function (module, exports, __dirname, __filename, process) {
    var Promise, emailRe, requestAnimationFrame;
    Promise = require('broken/lib');
    requestAnimationFrame = require('raf');
    emailRe = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    module.exports = {
      isRequired: function (value) {
        if (value && value !== '') {
          return value
        }
        throw new Error('Required')
      },
      isEmail: function (value) {
        if (!value) {
          return value
        }
        if (emailRe.test(value)) {
          return value.toLowerCase()
        }
        throw new Error('Enter a valid email')
      },
      isPassword: function (value) {
        if (!value) {
          return new Error('Required')
        }
        if (value.length >= 6) {
          return value
        }
        throw new Error('Password must be atleast 6 characters long.')
      },
      matchesPassword: function (value) {
        if (!value) {
          return new Error('Required')
        }
        if (value === this.get('user.password')) {
          return value
        }
        throw new Error('Passwords must match.')
      },
      splitName: function (value) {
        var i;
        if (!value) {
          return value
        }
        i = value.indexOf(' ');
        this.set('user.firstName', value.slice(0, i));
        this.set('user.lastName', value.slice(i + 1));
        return value
      }
    }
  });
  // source: node_modules/raf/index.js
  require.define('raf', function (module, exports, __dirname, __filename, process) {
    var now = require('performance-now/lib/performance-now'), root = typeof window === 'undefined' ? global : window, vendors = [
        'moz',
        'webkit'
      ], suffix = 'AnimationFrame', raf = root['request' + suffix], caf = root['cancel' + suffix] || root['cancelRequest' + suffix];
    for (var i = 0; !raf && i < vendors.length; i++) {
      raf = root[vendors[i] + 'Request' + suffix];
      caf = root[vendors[i] + 'Cancel' + suffix] || root[vendors[i] + 'CancelRequest' + suffix]
    }
    // Some versions of FF have rAF but not cAF
    if (!raf || !caf) {
      var last = 0, id = 0, queue = [], frameDuration = 1000 / 60;
      raf = function (callback) {
        if (queue.length === 0) {
          var _now = now(), next = Math.max(0, frameDuration - (_now - last));
          last = next + _now;
          setTimeout(function () {
            var cp = queue.slice(0);
            // Clear queue here to prevent
            // callbacks from appending listeners
            // to the current frame's queue
            queue.length = 0;
            for (var i = 0; i < cp.length; i++) {
              if (!cp[i].cancelled) {
                try {
                  cp[i].callback(last)
                } catch (e) {
                  setTimeout(function () {
                    throw e
                  }, 0)
                }
              }
            }
          }, Math.round(next))
        }
        queue.push({
          handle: ++id,
          callback: callback,
          cancelled: false
        });
        return id
      };
      caf = function (handle) {
        for (var i = 0; i < queue.length; i++) {
          if (queue[i].handle === handle) {
            queue[i].cancelled = true
          }
        }
      }
    }
    module.exports = function (fn) {
      // Wrap in a new function to prevent
      // `cancel` potentially being assigned
      // to the native rAF function
      return raf.call(root, fn)
    };
    module.exports.cancel = function () {
      caf.apply(root, arguments)
    };
    module.exports.polyfill = function () {
      root.requestAnimationFrame = raf;
      root.cancelAnimationFrame = caf
    }
  });
  // source: node_modules/performance-now/lib/performance-now.js
  require.define('performance-now/lib/performance-now', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.7.1
    (function () {
      var getNanoSeconds, hrtime, loadTime;
      if (typeof performance !== 'undefined' && performance !== null && performance.now) {
        module.exports = function () {
          return performance.now()
        }
      } else if (typeof process !== 'undefined' && process !== null && process.hrtime) {
        module.exports = function () {
          return (getNanoSeconds() - loadTime) / 1000000
        };
        hrtime = process.hrtime;
        getNanoSeconds = function () {
          var hr;
          hr = hrtime();
          return hr[0] * 1000000000 + hr[1]
        };
        loadTime = getNanoSeconds()
      } else if (Date.now) {
        module.exports = function () {
          return Date.now() - loadTime
        };
        loadTime = Date.now()
      } else {
        module.exports = function () {
          return new Date().getTime() - loadTime
        };
        loadTime = new Date().getTime()
      }
    }.call(this))
  });
  // source: example/js/events.coffee
  require.define('./events', function (module, exports, __dirname, __filename, process) {
    module.exports = {
      Change: 'change',
      ChangeSuccess: 'change-success',
      ChangeFailed: 'change-failed',
      Login: 'login',
      LoginSuccess: 'login-success',
      LoginFailed: 'login-failed'
    }
  });
  // source: example/js/templates/login.html
  require.define('./templates/login', function (module, exports, __dirname, __filename, process) {
    module.exports = '<form onsubmit={submit} if="{ !data.get(\'key\') }">\n  <text-control lookup="organization" placeholder="Organization"></text-control>\n  <text-control lookup="email" placeholder="Email"></text-control>\n  <text-control lookup="password" type="password" placeholder="Password"></text-control>\n  <button type="submit">Login</button>\n</form>\n\n'
  });
  // source: example/js/controls/index.coffee
  require.define('./controls', function (module, exports, __dirname, __filename, process) {
    module.exports = {
      Control: require('./controls/control'),
      Text: require('./controls/text'),
      register: function () {
        return this.Text.register()
      }
    }
  });
  // source: example/js/controls/control.coffee
  require.define('./controls/control', function (module, exports, __dirname, __filename, process) {
    var Control, CrowdControl, Events, m, riot, scrolling, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    CrowdControl = require('crowdcontrol/lib');
    m = require('./mediator');
    Events = require('./events');
    riot = require('riot/riot');
    scrolling = false;
    module.exports = Control = function (superClass) {
      extend(Control, superClass);
      function Control() {
        return Control.__super__.constructor.apply(this, arguments)
      }
      Control.prototype.init = function () {
        if (this.input == null && this.inputs != null) {
          this.input = this.inputs[this.lookup]
        }
        if (this.input != null) {
          return Control.__super__.init.apply(this, arguments)
        }
      };
      Control.prototype.getValue = function (event) {
        var ref;
        return (ref = $(event.target).val()) != null ? ref.trim() : void 0
      };
      Control.prototype.error = function (err) {
        if (err instanceof DOMException) {
          console.log('WARNING: Error in riot dom manipulation ignored.', err);
          return
        }
        Control.__super__.error.apply(this, arguments);
        if (!scrolling) {
          scrolling = true;
          $('html, body').animate({ scrollTop: $(this.root).offset().top - $(window).height() / 2 }, {
            complete: function () {
              return scrolling = false
            },
            duration: 500
          })
        }
        return m.trigger(Events.ChangeFailed, this.input.name, this.input.ref.get(this.input.name))
      };
      Control.prototype.change = function () {
        Control.__super__.change.apply(this, arguments);
        return m.trigger(Events.Change, this.input.name, this.input.ref.get(this.input.name))
      };
      Control.prototype.changed = function (value) {
        m.trigger(Events.ChangeSuccess, this.input.name, value);
        return riot.update()
      };
      return Control
    }(CrowdControl.Views.Input)
  });
  // source: example/js/controls/text.coffee
  require.define('./controls/text', function (module, exports, __dirname, __filename, process) {
    var Control, Text, placeholder, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    Control = require('./controls/control');
    placeholder = require('./utils/placeholder');
    module.exports = Text = function (superClass) {
      extend(Text, superClass);
      function Text() {
        return Text.__super__.constructor.apply(this, arguments)
      }
      Text.prototype.tag = 'text-control';
      Text.prototype.type = 'text';
      Text.prototype.html = require('./templates/controls/text');
      Text.prototype.formElement = 'input';
      Text.prototype.init = function () {
        Text.__super__.init.apply(this, arguments);
        console.log('text intiialized');
        return this.on('updated', function (_this) {
          return function () {
            var el;
            el = _this.root.getElementsByTagName(_this.formElement)[0];
            if (_this.type !== 'password') {
              return placeholder(el)
            }
          }
        }(this))
      };
      return Text
    }(Control)
  });
  // source: example/js/utils/placeholder.coffee
  require.define('./utils/placeholder', function (module, exports, __dirname, __filename, process) {
    var hidePlaceholderOnFocus, unfocusOnAnElement;
    hidePlaceholderOnFocus = function (event) {
      var target;
      target = event.currentTarget ? event.currentTarget : event.srcElement;
      if (target.value === target.getAttribute('placeholder')) {
        return target.value = ''
      }
    };
    unfocusOnAnElement = function (event) {
      var target;
      target = event.currentTarget ? event.currentTarget : event.srcElement;
      if (target.value === '') {
        return target.value = target.getAttribute('placeholder')
      }
    };
    if (document.createElement('input').placeholder != null) {
      module.exports = function () {
      }
    } else {
      module.exports = function (input) {
        var ref;
        input = (ref = input[0]) != null ? ref : input;
        if (input._placeholdered != null) {
          return
        }
        Object.defineProperty(input, '_placeholdered', {
          value: true,
          writable: true
        });
        if (!input.value) {
          input.value = input.getAttribute('placeholder')
        }
        if (input.addEventListener) {
          input.addEventListener('click', hidePlaceholderOnFocus, false);
          return input.addEventListener('blur', unfocusOnAnElement, false)
        } else if (input.attachEvent) {
          input.attachEvent('onclick', hidePlaceholderOnFocus);
          return input.attachEvent('onblur', unfocusOnAnElement)
        }
      }
    }
  });
  // source: example/js/templates/controls/text.html
  require.define('./templates/controls/text', function (module, exports, __dirname, __filename, process) {
    module.exports = '<input id="{ input.name }" name="{ name || input.name }" type="{ type }" onchange="{ change }" onblur="{ change }" value="{ input.ref(input.name) }" placeholder="{ placeholder }">\n<yield></yield>\n\n'
  });
  // source: example/js/utils/store.coffee
  require.define('./utils/store', function (module, exports, __dirname, __filename, process) {
    var cookies, store;
    store = require('store/store');
    cookies = require('cookies-js/dist/cookies');
    if (store.enabled) {
      module.exports = store
    } else {
      module.exports = {
        get: function (k) {
          var e, error, v;
          v = cookies.get(k);
          try {
            v = JSON.parse(v)
          } catch (error) {
            e = error
          }
          return v
        },
        set: function (k, v) {
          var keys, ref;
          keys = (ref = cookies.get('_keys')) != null ? ref : '';
          cookies.set('_keys', keys += ' ' + k);
          return cookies.set(k, JSON.stringify(v))
        },
        clear: function () {
          var i, k, keys, ks, len, ref;
          keys = (ref = cookies.get('_keys')) != null ? ref : '';
          ks = keys.split(' ');
          for (i = 0, len = ks.length; i < len; i++) {
            k = ks[i];
            cookies.expire(k)
          }
          return cookies.expire('_keys')
        }
      }
    }
  });
  // source: node_modules/store/store.js
  require.define('store/store', function (module, exports, __dirname, __filename, process) {
    'use strict'  // Module export pattern from
                  // https://github.com/umdjs/umd/blob/master/returnExports.js
;
    (function (root, factory) {
      if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory)
      } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory()
      } else {
        // Browser globals (root is window)
        root.store = factory()
      }
    }(this, function () {
      // Store.js
      var store = {}, win = typeof window != 'undefined' ? window : global, doc = win.document, localStorageName = 'localStorage', scriptTag = 'script', storage;
      store.disabled = false;
      store.version = '1.3.20';
      store.set = function (key, value) {
      };
      store.get = function (key, defaultVal) {
      };
      store.has = function (key) {
        return store.get(key) !== undefined
      };
      store.remove = function (key) {
      };
      store.clear = function () {
      };
      store.transact = function (key, defaultVal, transactionFn) {
        if (transactionFn == null) {
          transactionFn = defaultVal;
          defaultVal = null
        }
        if (defaultVal == null) {
          defaultVal = {}
        }
        var val = store.get(key, defaultVal);
        transactionFn(val);
        store.set(key, val)
      };
      store.getAll = function () {
      };
      store.forEach = function () {
      };
      store.serialize = function (value) {
        return JSON.stringify(value)
      };
      store.deserialize = function (value) {
        if (typeof value != 'string') {
          return undefined
        }
        try {
          return JSON.parse(value)
        } catch (e) {
          return value || undefined
        }
      };
      // Functions to encapsulate questionable FireFox 3.6.13 behavior
      // when about.config::dom.storage.enabled === false
      // See https://github.com/marcuswestin/store.js/issues#issue/13
      function isLocalStorageNameSupported() {
        try {
          return localStorageName in win && win[localStorageName]
        } catch (err) {
          return false
        }
      }
      if (isLocalStorageNameSupported()) {
        storage = win[localStorageName];
        store.set = function (key, val) {
          if (val === undefined) {
            return store.remove(key)
          }
          storage.setItem(key, store.serialize(val));
          return val
        };
        store.get = function (key, defaultVal) {
          var val = store.deserialize(storage.getItem(key));
          return val === undefined ? defaultVal : val
        };
        store.remove = function (key) {
          storage.removeItem(key)
        };
        store.clear = function () {
          storage.clear()
        };
        store.getAll = function () {
          var ret = {};
          store.forEach(function (key, val) {
            ret[key] = val
          });
          return ret
        };
        store.forEach = function (callback) {
          for (var i = 0; i < storage.length; i++) {
            var key = storage.key(i);
            callback(key, store.get(key))
          }
        }
      } else if (doc && doc.documentElement.addBehavior) {
        var storageOwner, storageContainer;
        // Since #userData storage applies only to specific paths, we need to
        // somehow link our data to a specific path.  We choose /favicon.ico
        // as a pretty safe option, since all browsers already make a request to
        // this URL anyway and being a 404 will not hurt us here.  We wrap an
        // iframe pointing to the favicon in an ActiveXObject(htmlfile) object
        // (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
        // since the iframe access rules appear to allow direct access and
        // manipulation of the document element, even for a 404 page.  This
        // document can be used instead of the current document (which would
        // have been limited to the current path) to perform #userData storage.
        try {
          storageContainer = new ActiveXObject('htmlfile');
          storageContainer.open();
          storageContainer.write('<' + scriptTag + '>document.w=window</' + scriptTag + '><iframe src="/favicon.ico"></iframe>');
          storageContainer.close();
          storageOwner = storageContainer.w.frames[0].document;
          storage = storageOwner.createElement('div')
        } catch (e) {
          // somehow ActiveXObject instantiation failed (perhaps some special
          // security settings or otherwse), fall back to per-path storage
          storage = doc.createElement('div');
          storageOwner = doc.body
        }
        var withIEStorage = function (storeFunction) {
          return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(storage);
            // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
            // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
            storageOwner.appendChild(storage);
            storage.addBehavior('#default#userData');
            storage.load(localStorageName);
            var result = storeFunction.apply(store, args);
            storageOwner.removeChild(storage);
            return result
          }
        };
        // In IE7, keys cannot start with a digit or contain certain chars.
        // See https://github.com/marcuswestin/store.js/issues/40
        // See https://github.com/marcuswestin/store.js/issues/83
        var forbiddenCharsRegex = new RegExp('[!"#$%&\'()*+,/\\\\:;<=>?@[\\]^`{|}~]', 'g');
        var ieKeyFix = function (key) {
          return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
        };
        store.set = withIEStorage(function (storage, key, val) {
          key = ieKeyFix(key);
          if (val === undefined) {
            return store.remove(key)
          }
          storage.setAttribute(key, store.serialize(val));
          storage.save(localStorageName);
          return val
        });
        store.get = withIEStorage(function (storage, key, defaultVal) {
          key = ieKeyFix(key);
          var val = store.deserialize(storage.getAttribute(key));
          return val === undefined ? defaultVal : val
        });
        store.remove = withIEStorage(function (storage, key) {
          key = ieKeyFix(key);
          storage.removeAttribute(key);
          storage.save(localStorageName)
        });
        store.clear = withIEStorage(function (storage) {
          var attributes = storage.XMLDocument.documentElement.attributes;
          storage.load(localStorageName);
          for (var i = attributes.length - 1; i >= 0; i--) {
            storage.removeAttribute(attributes[i].name)
          }
          storage.save(localStorageName)
        });
        store.getAll = function (storage) {
          var ret = {};
          store.forEach(function (key, val) {
            ret[key] = val
          });
          return ret
        };
        store.forEach = withIEStorage(function (storage, callback) {
          var attributes = storage.XMLDocument.documentElement.attributes;
          for (var i = 0, attr; attr = attributes[i]; ++i) {
            callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
          }
        })
      }
      try {
        var testKey = '__storejs__';
        store.set(testKey, testKey);
        if (store.get(testKey) != testKey) {
          store.disabled = true
        }
        store.remove(testKey)
      } catch (e) {
        store.disabled = true
      }
      store.enabled = !store.disabled;
      return store
    }))
  });
  // source: node_modules/cookies-js/dist/cookies.js
  require.define('cookies-js/dist/cookies', function (module, exports, __dirname, __filename, process) {
    /*
 * Cookies.js - 1.2.2
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
    (function (global, undefined) {
      'use strict';
      var factory = function (window) {
        if (typeof window.document !== 'object') {
          throw new Error('Cookies.js requires a `window` with a `document` object')
        }
        var Cookies = function (key, value, options) {
          return arguments.length === 1 ? Cookies.get(key) : Cookies.set(key, value, options)
        };
        // Allows for setter injection in unit tests
        Cookies._document = window.document;
        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.';
        // Hurr hurr, :)
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');
        Cookies.defaults = {
          path: '/',
          secure: false
        };
        Cookies.get = function (key) {
          if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
            Cookies._renewCache()
          }
          var value = Cookies._cache[Cookies._cacheKeyPrefix + key];
          return value === undefined ? undefined : decodeURIComponent(value)
        };
        Cookies.set = function (key, value, options) {
          options = Cookies._getExtendedOptions(options);
          options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);
          Cookies._document.cookie = Cookies._generateCookieString(key, value, options);
          return Cookies
        };
        Cookies.expire = function (key, options) {
          return Cookies.set(key, undefined, options)
        };
        Cookies._getExtendedOptions = function (options) {
          return {
            path: options && options.path || Cookies.defaults.path,
            domain: options && options.domain || Cookies.defaults.domain,
            expires: options && options.expires || Cookies.defaults.expires,
            secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure
          }
        };
        Cookies._isValidDate = function (date) {
          return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())
        };
        Cookies._getExpiresDate = function (expires, now) {
          now = now || new Date;
          if (typeof expires === 'number') {
            expires = expires === Infinity ? Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000)
          } else if (typeof expires === 'string') {
            expires = new Date(expires)
          }
          if (expires && !Cookies._isValidDate(expires)) {
            throw new Error('`expires` parameter cannot be converted to a valid Date instance')
          }
          return expires
        };
        Cookies._generateCookieString = function (key, value, options) {
          key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
          key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
          value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
          options = options || {};
          var cookieString = key + '=' + value;
          cookieString += options.path ? ';path=' + options.path : '';
          cookieString += options.domain ? ';domain=' + options.domain : '';
          cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
          cookieString += options.secure ? ';secure' : '';
          return cookieString
        };
        Cookies._getCacheFromString = function (documentCookie) {
          var cookieCache = {};
          var cookiesArray = documentCookie ? documentCookie.split('; ') : [];
          for (var i = 0; i < cookiesArray.length; i++) {
            var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);
            if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
              cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value
            }
          }
          return cookieCache
        };
        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
          // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
          var separatorIndex = cookieString.indexOf('=');
          // IE omits the "=" when the cookie value is an empty string
          separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;
          var key = cookieString.substr(0, separatorIndex);
          var decodedKey;
          try {
            decodedKey = decodeURIComponent(key)
          } catch (e) {
            if (console && typeof console.error === 'function') {
              console.error('Could not decode cookie with key "' + key + '"', e)
            }
          }
          return {
            key: decodedKey,
            value: cookieString.substr(separatorIndex + 1)  // Defer decoding value until accessed
          }
        };
        Cookies._renewCache = function () {
          Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
          Cookies._cachedDocumentCookie = Cookies._document.cookie
        };
        Cookies._areEnabled = function () {
          var testKey = 'cookies.js';
          var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
          Cookies.expire(testKey);
          return areEnabled
        };
        Cookies.enabled = Cookies._areEnabled();
        return Cookies
      };
      var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;
      // AMD support
      if (typeof define === 'function' && define.amd) {
        define(function () {
          return cookiesExport
        })  // CommonJS/Node.js support
      } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
          exports = module.exports = cookiesExport
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport
      } else {
        global.Cookies = cookiesExport
      }
    }(typeof window === 'undefined' ? this : window))
  });
  // source: node_modules/hanzo.js/lib/browser.js
  require.define('hanzo.js/lib/browser', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Api, Client;
    if (global.Hanzo == null) {
      global.Hanzo = {}
    }
    Api = require('hanzo.js/lib/api');
    Client = require('hanzo.js/lib/client/xhr');
    Api.CLIENT = Client;
    Api.BLUEPRINTS = require('hanzo.js/lib/blueprints/browser');
    Hanzo.Api = Api;
    Hanzo.Client = Client;
    module.exports = Hanzo  //# sourceMappingURL=browser.js.map
  });
  // source: node_modules/hanzo.js/lib/api.js
  require.define('hanzo.js/lib/api', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Api, isFunction, isString, newError, ref, statusOk;
    ref = require('hanzo.js/lib/utils'), isFunction = ref.isFunction, isString = ref.isString, newError = ref.newError, statusOk = ref.statusOk;
    module.exports = Api = function () {
      Api.BLUEPRINTS = {};
      Api.CLIENT = null;
      function Api(opts) {
        var blueprints, client, debug, endpoint, k, key, v;
        if (opts == null) {
          opts = {}
        }
        if (!(this instanceof Api)) {
          return new Api(opts)
        }
        endpoint = opts.endpoint, debug = opts.debug, key = opts.key, client = opts.client, blueprints = opts.blueprints;
        this.debug = debug;
        if (blueprints == null) {
          blueprints = this.constructor.BLUEPRINTS
        }
        if (client) {
          this.client = client
        } else {
          this.client = new this.constructor.CLIENT({
            debug: debug,
            endpoint: endpoint,
            key: key
          })
        }
        for (k in blueprints) {
          v = blueprints[k];
          this.addBlueprints(k, v)
        }
      }
      Api.prototype.addBlueprints = function (api, blueprints) {
        var bp, fn, name;
        if (this[api] == null) {
          this[api] = {}
        }
        fn = function (_this) {
          return function (name, bp) {
            var method;
            if (isFunction(bp)) {
              return _this[api][name] = function () {
                return bp.apply(_this, arguments)
              }
            }
            if (bp.expects == null) {
              bp.expects = statusOk
            }
            if (bp.method == null) {
              bp.method = 'POST'
            }
            method = function (data, cb) {
              var key;
              key = void 0;
              if (bp.useCustomerToken) {
                key = _this.client.getCustomerToken()
              }
              return _this.client.request(bp, data, key).then(function (res) {
                var ref1, ref2;
                if (((ref1 = res.data) != null ? ref1.error : void 0) != null) {
                  throw newError(data, res)
                }
                if (!bp.expects(res)) {
                  throw newError(data, res)
                }
                if (bp.process != null) {
                  bp.process.call(_this, res)
                }
                return (ref2 = res.data) != null ? ref2 : res.body
              }).callback(cb)
            };
            return _this[api][name] = method
          }
        }(this);
        for (name in blueprints) {
          bp = blueprints[name];
          fn(name, bp)
        }
      };
      Api.prototype.setKey = function (key) {
        return this.client.setKey(key)
      };
      Api.prototype.setCustomerToken = function (key) {
        return this.client.setCustomerToken(key)
      };
      Api.prototype.deleteCustomerToken = function () {
        return this.client.deleteCustomerToken()
      };
      Api.prototype.setStore = function (id) {
        this.storeId = id;
        return this.client.setStore(id)
      };
      return Api
    }()  //# sourceMappingURL=api.js.map
  });
  // source: node_modules/hanzo.js/lib/utils.js
  require.define('hanzo.js/lib/utils', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    exports.isFunction = function (fn) {
      return typeof fn === 'function'
    };
    exports.isString = function (s) {
      return typeof s === 'string'
    };
    exports.statusOk = function (res) {
      return res.status === 200
    };
    exports.statusCreated = function (res) {
      return res.status === 201
    };
    exports.statusNoContent = function (res) {
      return res.status === 204
    };
    exports.newError = function (data, res) {
      var err, message, ref, ref1, ref2, ref3, ref4;
      if (res == null) {
        res = {}
      }
      message = (ref = res != null ? (ref1 = res.data) != null ? (ref2 = ref1.error) != null ? ref2.message : void 0 : void 0 : void 0) != null ? ref : 'Request failed';
      err = new Error(message);
      err.message = message;
      err.req = data;
      err.data = res.data;
      err.responseText = res.data;
      err.status = res.status;
      err.type = (ref3 = res.data) != null ? (ref4 = ref3.error) != null ? ref4.type : void 0 : void 0;
      return err
    };
    exports.updateQuery = function (url, key, value) {
      var hash, re, separator;
      re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi');
      if (re.test(url)) {
        if (value != null) {
          return url.replace(re, '$1' + key + '=' + value + '$2$3')
        } else {
          hash = url.split('#');
          url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
          if (hash[1] != null) {
            url += '#' + hash[1]
          }
          return url
        }
      } else {
        if (value != null) {
          separator = url.indexOf('?') !== -1 ? '&' : '?';
          hash = url.split('#');
          url = hash[0] + separator + key + '=' + value;
          if (hash[1] != null) {
            url += '#' + hash[1]
          }
          return url
        } else {
          return url
        }
      }
    };
    exports.formatData = function (bp, data) {
      var k, params, v;
      if (bp.encode === 'form') {
        params = [];
        for (k in data) {
          v = data[k];
          params.push(k + '=' + v)
        }
        return params.join('&')
      } else {
        return JSON.stringify(data)
      }
    }  //# sourceMappingURL=utils.js.map
  });
  // source: node_modules/hanzo.js/lib/client/xhr.js
  require.define('hanzo.js/lib/client/xhr', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Xhr, XhrClient, cookie, formatData, isFunction, newError, ref, updateQuery;
    Xhr = require('xhr-promise-es6/lib');
    Xhr.Promise = require('broken/lib');
    cookie = require('js-cookie/src/js.cookie');
    ref = require('hanzo.js/lib/utils'), isFunction = ref.isFunction, newError = ref.newError, updateQuery = ref.updateQuery, formatData = ref.formatData;
    module.exports = XhrClient = function () {
      XhrClient.prototype.debug = false;
      XhrClient.prototype.endpoint = 'https://api.hanzo.io';
      XhrClient.prototype.sessionName = 'hnzo';
      function XhrClient(opts) {
        if (opts == null) {
          opts = {}
        }
        if (!(this instanceof XhrClient)) {
          return new XhrClient(opts)
        }
        this.key = opts.key, this.debug = opts.debug;
        if (opts.endpoint) {
          this.setEndpoint(opts.endpoint)
        }
        this.getCustomerToken()
      }
      XhrClient.prototype.setEndpoint = function (endpoint) {
        return this.endpoint = endpoint.replace(/\/$/, '')
      };
      XhrClient.prototype.setStore = function (id) {
        return this.storeId = id
      };
      XhrClient.prototype.setKey = function (key) {
        return this.key = key
      };
      XhrClient.prototype.getKey = function () {
        return this.key || this.constructor.KEY
      };
      XhrClient.prototype.getCustomerToken = function () {
        var session;
        if ((session = cookie.getJSON(this.sessionName)) != null) {
          if (session.customerToken != null) {
            this.customerToken = session.customerToken
          }
        }
        return this.customerToken
      };
      XhrClient.prototype.setCustomerToken = function (key) {
        cookie.set(this.sessionName, { customerToken: key }, { expires: 7 * 24 * 3600 * 1000 });
        return this.customerToken = key
      };
      XhrClient.prototype.deleteCustomerToken = function () {
        cookie.set(this.sessionName, { customerToken: null }, { expires: 7 * 24 * 3600 * 1000 });
        return this.customerToken = null
      };
      XhrClient.prototype.getUrl = function (url, data, key) {
        if (isFunction(url)) {
          url = url.call(this, data)
        }
        return updateQuery(this.endpoint + url, 'token', key)
      };
      XhrClient.prototype.request = function (blueprint, data, key) {
        var opts;
        if (key == null) {
          key = this.getKey()
        }
        opts = {
          url: this.getUrl(blueprint.url, data, key),
          method: blueprint.method,
          data: formatData(blueprint, data)
        };
        if (this.debug) {
          console.log('--KEY--');
          console.log(key);
          console.log('--REQUEST--');
          console.log(opts)
        }
        return new Xhr().send(opts).then(function (res) {
          if (this.debug) {
            console.log('--RESPONSE--');
            console.log(res)
          }
          res.data = res.responseText;
          return res
        })['catch'](function (res) {
          var err, error, ref1;
          try {
            res.data = (ref1 = res.responseText) != null ? ref1 : JSON.parse(res.xhr.responseText)
          } catch (error) {
            err = error
          }
          err = newError(data, res);
          if (this.debug) {
            console.log('--RESPONSE--');
            console.log(res);
            console.log('ERROR:', err)
          }
          throw err
        })
      };
      return XhrClient
    }()  //# sourceMappingURL=xhr.js.map
  });
  // source: node_modules/hanzo.js/node_modules/js-cookie/src/js.cookie.js
  require.define('js-cookie/src/js.cookie', function (module, exports, __dirname, __filename, process) {
    /*!
 * JavaScript Cookie v2.1.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
    (function (factory) {
      if (typeof define === 'function' && define.amd) {
        define(factory)
      } else if (typeof exports === 'object') {
        module.exports = factory()
      } else {
        var _OldCookies = window.Cookies;
        var api = window.Cookies = factory();
        api.noConflict = function () {
          window.Cookies = _OldCookies;
          return api
        }
      }
    }(function () {
      function extend() {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
          var attributes = arguments[i];
          for (var key in attributes) {
            result[key] = attributes[key]
          }
        }
        return result
      }
      function init(converter) {
        function api(key, value, attributes) {
          var result;
          // Write
          if (arguments.length > 1) {
            attributes = extend({ path: '/' }, api.defaults, attributes);
            if (typeof attributes.expires === 'number') {
              var expires = new Date;
              expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 86400000);
              attributes.expires = expires
            }
            try {
              result = JSON.stringify(value);
              if (/^[\{\[]/.test(result)) {
                value = result
              }
            } catch (e) {
            }
            if (!converter.write) {
              value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent)
            } else {
              value = converter.write(value, key)
            }
            key = encodeURIComponent(String(key));
            key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
            key = key.replace(/[\(\)]/g, escape);
            return document.cookie = [
              key,
              '=',
              value,
              attributes.expires && '; expires=' + attributes.expires.toUTCString(),
              // use expires attribute, max-age is not supported by IE
              attributes.path && '; path=' + attributes.path,
              attributes.domain && '; domain=' + attributes.domain,
              attributes.secure ? '; secure' : ''
            ].join('')
          }
          // Read
          if (!key) {
            result = {}
          }
          // To prevent the for loop in the first place assign an empty array
          // in case there are no cookies at all. Also prevents odd result when
          // calling "get()"
          var cookies = document.cookie ? document.cookie.split('; ') : [];
          var rdecode = /(%[0-9A-Z]{2})+/g;
          var i = 0;
          for (; i < cookies.length; i++) {
            var parts = cookies[i].split('=');
            var name = parts[0].replace(rdecode, decodeURIComponent);
            var cookie = parts.slice(1).join('=');
            if (cookie.charAt(0) === '"') {
              cookie = cookie.slice(1, -1)
            }
            try {
              cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);
              if (this.json) {
                try {
                  cookie = JSON.parse(cookie)
                } catch (e) {
                }
              }
              if (key === name) {
                result = cookie;
                break
              }
              if (!key) {
                result[name] = cookie
              }
            } catch (e) {
            }
          }
          return result
        }
        api.get = api.set = api;
        api.getJSON = function () {
          return api.apply({ json: true }, [].slice.call(arguments))
        };
        api.defaults = {};
        api.remove = function (key, attributes) {
          api(key, '', extend(attributes, { expires: -1 }))
        };
        api.withConverter = init;
        return api
      }
      return init(function () {
      })
    }))
  });
  // source: node_modules/hanzo.js/lib/blueprints/browser.js
  require.define('hanzo.js/lib/blueprints/browser', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var blueprints, byId, createBlueprint, fn, i, isFunction, len, model, models, ref, ref1, statusCreated, statusNoContent, statusOk, storePrefixed, userModels;
    ref = require('hanzo.js/lib/utils'), isFunction = ref.isFunction, statusCreated = ref.statusCreated, statusNoContent = ref.statusNoContent, statusOk = ref.statusOk;
    ref1 = require('hanzo.js/lib/blueprints/url'), byId = ref1.byId, storePrefixed = ref1.storePrefixed;
    createBlueprint = function (name) {
      var endpoint;
      endpoint = '/' + name;
      return {
        list: {
          url: endpoint,
          method: 'GET',
          expects: statusOk
        },
        get: {
          url: byId(name),
          method: 'GET',
          expects: statusOk
        }
      }
    };
    blueprints = {
      account: {
        get: {
          url: '/account',
          method: 'GET',
          expects: statusOk,
          useCustomerToken: true
        },
        update: {
          url: '/account',
          method: 'PATCH',
          expects: statusOk,
          useCustomerToken: true
        },
        exists: {
          url: function (x) {
            var ref2, ref3, ref4;
            return '/account/exists/' + ((ref2 = (ref3 = (ref4 = x.email) != null ? ref4 : x.username) != null ? ref3 : x.id) != null ? ref2 : x)
          },
          method: 'GET',
          expects: statusOk,
          process: function (res) {
            return res.data.exists
          }
        },
        create: {
          url: '/account/create',
          method: 'POST',
          expects: statusCreated
        },
        enable: {
          url: function (x) {
            var ref2;
            return '/account/enable/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          },
          method: 'POST',
          expects: statusOk
        },
        login: {
          url: '/account/login',
          method: 'POST',
          expects: statusOk,
          process: function (res) {
            this.setCustomerToken(res.data.token);
            return res
          }
        },
        logout: function () {
          return this.deleteCustomerToken()
        },
        reset: {
          url: '/account/reset',
          method: 'POST',
          expects: statusOk,
          useCustomerToken: true
        },
        confirm: {
          url: function (x) {
            var ref2;
            return '/account/confirm/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          },
          method: 'POST',
          expects: statusOk,
          useCustomerToken: true
        }
      },
      checkout: {
        authorize: {
          url: storePrefixed('/checkout/authorize'),
          method: 'POST',
          expects: statusOk
        },
        capture: {
          url: storePrefixed(function (x) {
            var ref2;
            return '/checkout/capture/' + ((ref2 = x.orderId) != null ? ref2 : x)
          }),
          method: 'POST',
          expects: statusOk
        },
        charge: {
          url: storePrefixed('/checkout/charge'),
          method: 'POST',
          expects: statusOk
        },
        paypal: {
          url: storePrefixed('/checkout/paypal'),
          method: 'POST',
          expects: statusOk
        }
      },
      referrer: {
        create: {
          url: '/referrer',
          method: 'POST',
          expects: statusCreated
        }
      }
    };
    models = [
      'collection',
      'coupon',
      'product',
      'variant'
    ];
    userModels = [
      'order',
      'subscription'
    ];
    fn = function (model) {
      return blueprints[model] = createBlueprint(model)
    };
    for (i = 0, len = models.length; i < len; i++) {
      model = models[i];
      fn(model)
    }
    module.exports = blueprints  //# sourceMappingURL=browser.js.map
  });
  // source: node_modules/hanzo.js/lib/blueprints/url.js
  require.define('hanzo.js/lib/blueprints/url', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var isFunction, sp;
    isFunction = require('hanzo.js/lib/utils').isFunction;
    exports.storePrefixed = sp = function (u) {
      return function (x) {
        var url;
        if (isFunction(u)) {
          url = u(x)
        } else {
          url = u
        }
        if (this.storeId != null) {
          return '/store/' + this.storeId + url
        } else {
          return url
        }
      }
    };
    exports.byId = function (name) {
      switch (name) {
      case 'coupon':
        return sp(function (x) {
          var ref;
          return '/coupon/' + ((ref = x.code) != null ? ref : x)
        });
      case 'collection':
        return sp(function (x) {
          var ref;
          return '/collection/' + ((ref = x.slug) != null ? ref : x)
        });
      case 'product':
        return sp(function (x) {
          var ref, ref1;
          return '/product/' + ((ref = (ref1 = x.id) != null ? ref1 : x.slug) != null ? ref : x)
        });
      case 'variant':
        return sp(function (x) {
          var ref, ref1;
          return '/variant/' + ((ref = (ref1 = x.id) != null ? ref1 : x.sku) != null ? ref : x)
        });
      case 'site':
        return function (x) {
          var ref, ref1;
          return '/site/' + ((ref = (ref1 = x.id) != null ? ref1 : x.name) != null ? ref : x)
        };
      default:
        return function (x) {
          var ref;
          return '/' + name + '/' + ((ref = x.id) != null ? ref : x)
        }
      }
    }  //# sourceMappingURL=url.js.map
  });
  // source: example/js/blueprints.coffee
  require.define('./blueprints', function (module, exports, __dirname, __filename, process) {
    module.exports = {
      oauth: {
        auth: {
          method: 'POST',
          url: '/auth'
        }
      }
    }
  });
  // source: example/js/app.coffee
  require.define('app', function (module, exports, __dirname, __filename, process) {
    var Api, Controls, Events, Views, blueprints, client, d, data, k, m, refer, riot, store, v;
    riot = require('riot/riot');
    window.riot = riot;
    refer = require('referential/lib');
    m = require('./mediator');
    Views = require('./views');
    Controls = require('./controls');
    Events = require('./events');
    store = require('./utils/store');
    window.Dashboard = { Views: Views };
    Views.register();
    Controls.register();
    Api = require('hanzo.js/lib/browser').Api;
    blueprints = require('./blueprints');
    client = new Api({
      debug: true,
      endpoint: 'https://api-dot-hanzo-staging.appspot.com'
    });
    for (k in blueprints) {
      v = blueprints[k];
      client.addBlueprints(k, v)
    }
    d = store.get('data');
    if (d == null) {
      data = refer({ key: '' })
    } else {
      data = refer(d)
    }
    Daisho.init('/example', '/example/fixtures/modules.json').then(function () {
      var key, p;
      key = data.get('key');
      if (key) {
        return key
      }
      p = new Promise(function (resolve, reject) {
        riot.mount('login', {
          client: client,
          data: data
        });
        return m.on(Events.LoginSuccess, function (res) {
          data.set('key', res.access_token);
          store.set('data', data.get());
          riot.update();
          return resolve(res.access_token)
        })
      });
      return p
    }).then(function (key) {
      client.setKey(key);
      return Daisho.load([
        'home',
        'user'
      ])
    }).then(function (data) {
      return riot.mount('dashboard', {
        modules: data.modules,
        moduleList: data.moduleList,
        api: client
      })
    }).then(function () {
      Daisho.setRenderElement($('dashboard > section')[0]);
      return Daisho.route('home')
    })
  });
  require('app')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yaW90L3Jpb3QuanMiLCJub2RlX21vZHVsZXMvcmVmZXJlbnRpYWwvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZmVyZW50aWFsL2xpYi9yZWZlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWZlcmVudGlhbC9saWIvcmVmLmpzIiwibm9kZV9tb2R1bGVzL25vZGUuZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL25vZGUuZXh0ZW5kL2xpYi9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvaXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtbnVtYmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1zdHJpbmcvaW5kZXguanMiLCJtZWRpYXRvci5jb2ZmZWUiLCJ2aWV3cy9pbmRleC5jb2ZmZWUiLCJ2aWV3cy9kYXNoYm9hcmQuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY3Jvd2Rjb250cm9sL2xpYi9yaW90LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvdmlld3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY3Jvd2Rjb250cm9sL2xpYi92aWV3cy9mb3JtLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvdmlld3Mvdmlldy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvdmlld3MvaW5wdXRpZnkuanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9taXNlLXNldHRsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9taXNlLXNldHRsZS9saWIvcHJvbWlzZS1zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvY3Jvd2Rjb250cm9sL2xpYi92aWV3cy9pbnB1dC5qcyIsIlVzZXJzL2R0YWkvd29yay9oYW56by9kYWlzaG8vc3JjL2luZGV4LmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhZ2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGF0aC10by1yZWdleHAvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsInRlbXBsYXRlcy9kYXNoYm9hcmQuaHRtbCIsInZpZXdzL2xvZ2luLmNvZmZlZSIsInZpZXdzL21pZGRsZXdhcmUuY29mZmVlIiwibm9kZV9tb2R1bGVzL3JhZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wZXJmb3JtYW5jZS1ub3cvbGliL3BlcmZvcm1hbmNlLW5vdy5qcyIsImV2ZW50cy5jb2ZmZWUiLCJ0ZW1wbGF0ZXMvbG9naW4uaHRtbCIsImNvbnRyb2xzL2luZGV4LmNvZmZlZSIsImNvbnRyb2xzL2NvbnRyb2wuY29mZmVlIiwiY29udHJvbHMvdGV4dC5jb2ZmZWUiLCJ1dGlscy9wbGFjZWhvbGRlci5jb2ZmZWUiLCJ0ZW1wbGF0ZXMvY29udHJvbHMvdGV4dC5odG1sIiwidXRpbHMvc3RvcmUuY29mZmVlIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JlLmpzIiwibm9kZV9tb2R1bGVzL2Nvb2tpZXMtanMvZGlzdC9jb29raWVzLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL2xpYi9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL2xpYi9hcGkuanMiLCJub2RlX21vZHVsZXMvaGFuem8uanMvbGliL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL2xpYi9jbGllbnQveGhyLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL25vZGVfbW9kdWxlcy9qcy1jb29raWUvc3JjL2pzLmNvb2tpZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW56by5qcy9saWIvYmx1ZXByaW50cy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL2xpYi9ibHVlcHJpbnRzL3VybC5qcyIsImJsdWVwcmludHMuY29mZmVlIiwiYXBwLmNvZmZlZSJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJ1bmRlZmluZWQiLCJyaW90IiwidmVyc2lvbiIsInNldHRpbmdzIiwiX191aWQiLCJfX3ZpcnR1YWxEb20iLCJfX3RhZ0ltcGwiLCJHTE9CQUxfTUlYSU4iLCJSSU9UX1BSRUZJWCIsIlJJT1RfVEFHIiwiUklPVF9UQUdfSVMiLCJUX1NUUklORyIsIlRfT0JKRUNUIiwiVF9VTkRFRiIsIlRfQk9PTCIsIlRfRlVOQ1RJT04iLCJTUEVDSUFMX1RBR1NfUkVHRVgiLCJSRVNFUlZFRF9XT1JEU19CTEFDS0xJU1QiLCJJRV9WRVJTSU9OIiwiZG9jdW1lbnQiLCJkb2N1bWVudE1vZGUiLCJvYnNlcnZhYmxlIiwiZWwiLCJjYWxsYmFja3MiLCJzbGljZSIsIkFycmF5IiwicHJvdG90eXBlIiwib25FYWNoRXZlbnQiLCJlIiwiZm4iLCJyZXBsYWNlIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydGllcyIsIm9uIiwidmFsdWUiLCJldmVudHMiLCJuYW1lIiwicG9zIiwicHVzaCIsInR5cGVkIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiY29uZmlndXJhYmxlIiwib2ZmIiwiYXJyIiwiaSIsImNiIiwic3BsaWNlIiwib25lIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJ0cmlnZ2VyIiwiYXJnbGVuIiwibGVuZ3RoIiwiYXJncyIsImZucyIsImNhbGwiLCJidXN5IiwiY29uY2F0IiwiUkVfT1JJR0lOIiwiRVZFTlRfTElTVEVORVIiLCJSRU1PVkVfRVZFTlRfTElTVEVORVIiLCJBRERfRVZFTlRfTElTVEVORVIiLCJIQVNfQVRUUklCVVRFIiwiUkVQTEFDRSIsIlBPUFNUQVRFIiwiSEFTSENIQU5HRSIsIlRSSUdHRVIiLCJNQVhfRU1JVF9TVEFDS19MRVZFTCIsIndpbiIsImRvYyIsImhpc3QiLCJoaXN0b3J5IiwibG9jIiwibG9jYXRpb24iLCJwcm90IiwiUm91dGVyIiwiY2xpY2tFdmVudCIsIm9udG91Y2hzdGFydCIsInN0YXJ0ZWQiLCJjZW50cmFsIiwicm91dGVGb3VuZCIsImRlYm91bmNlZEVtaXQiLCJiYXNlIiwiY3VycmVudCIsInBhcnNlciIsInNlY29uZFBhcnNlciIsImVtaXRTdGFjayIsImVtaXRTdGFja0xldmVsIiwiREVGQVVMVF9QQVJTRVIiLCJwYXRoIiwic3BsaXQiLCJERUZBVUxUX1NFQ09ORF9QQVJTRVIiLCJmaWx0ZXIiLCJyZSIsIlJlZ0V4cCIsIm1hdGNoIiwiZGVib3VuY2UiLCJkZWxheSIsInQiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwic3RhcnQiLCJhdXRvRXhlYyIsImVtaXQiLCJjbGljayIsIiQiLCJzIiwiYmluZCIsIm5vcm1hbGl6ZSIsImlzU3RyaW5nIiwic3RyIiwiZ2V0UGF0aEZyb21Sb290IiwiaHJlZiIsImdldFBhdGhGcm9tQmFzZSIsImZvcmNlIiwiaXNSb290Iiwic2hpZnQiLCJ3aGljaCIsIm1ldGFLZXkiLCJjdHJsS2V5Iiwic2hpZnRLZXkiLCJkZWZhdWx0UHJldmVudGVkIiwidGFyZ2V0Iiwibm9kZU5hbWUiLCJwYXJlbnROb2RlIiwiaW5kZXhPZiIsImdvIiwidGl0bGUiLCJwcmV2ZW50RGVmYXVsdCIsInNob3VsZFJlcGxhY2UiLCJyZXBsYWNlU3RhdGUiLCJwdXNoU3RhdGUiLCJtIiwiZmlyc3QiLCJzZWNvbmQiLCJ0aGlyZCIsInIiLCJzb21lIiwiYWN0aW9uIiwibWFpblJvdXRlciIsInJvdXRlIiwiY3JlYXRlIiwibmV3U3ViUm91dGVyIiwic3RvcCIsImFyZyIsImV4ZWMiLCJmbjIiLCJxdWVyeSIsInEiLCJfIiwiayIsInYiLCJyZWFkeVN0YXRlIiwiYnJhY2tldHMiLCJVTkRFRiIsIlJFR0xPQiIsIlJfTUxDT01NUyIsIlJfU1RSSU5HUyIsIlNfUUJMT0NLUyIsInNvdXJjZSIsIkZJTkRCUkFDRVMiLCJERUZBVUxUIiwiX3BhaXJzIiwiY2FjaGVkQnJhY2tldHMiLCJfcmVnZXgiLCJfY2FjaGUiLCJfc2V0dGluZ3MiLCJfbG9vcGJhY2siLCJfcmV3cml0ZSIsImJwIiwiZ2xvYmFsIiwiX2NyZWF0ZSIsInBhaXIiLCJ0ZXN0IiwiRXJyb3IiLCJfYnJhY2tldHMiLCJyZU9ySWR4IiwidG1wbCIsIl9icCIsInBhcnRzIiwiaXNleHByIiwibGFzdEluZGV4IiwiaW5kZXgiLCJza2lwQnJhY2VzIiwidW5lc2NhcGVTdHIiLCJjaCIsIml4IiwicmVjY2giLCJoYXNFeHByIiwibG9vcEtleXMiLCJleHByIiwia2V5IiwidmFsIiwidHJpbSIsImhhc1JhdyIsInNyYyIsImFycmF5IiwiX3Jlc2V0IiwiX3NldFNldHRpbmdzIiwibyIsImIiLCJkZWZpbmVQcm9wZXJ0eSIsInNldCIsImdldCIsIl90bXBsIiwiZGF0YSIsIl9sb2dFcnIiLCJoYXZlUmF3IiwiZXJyb3JIYW5kbGVyIiwiZXJyIiwiY3R4IiwicmlvdERhdGEiLCJ0YWdOYW1lIiwicm9vdCIsIl9yaW90X2lkIiwiX2dldFRtcGwiLCJGdW5jdGlvbiIsIlJFX1FCTE9DSyIsIlJFX1FCTUFSSyIsInFzdHIiLCJqIiwibGlzdCIsIl9wYXJzZUV4cHIiLCJqb2luIiwiUkVfQlJFTkQiLCJDU19JREVOVCIsImFzVGV4dCIsImRpdiIsImNudCIsImpzYiIsInJpZ2h0Q29udGV4dCIsIl93cmFwRXhwciIsIm1tIiwibHYiLCJpciIsIkpTX0NPTlRFWFQiLCJKU19WQVJOQU1FIiwiSlNfTk9QUk9QUyIsInRiIiwicCIsIm12YXIiLCJwYXJzZSIsIm1rZG9tIiwiX21rZG9tIiwicmVIYXNZaWVsZCIsInJlWWllbGRBbGwiLCJyZVlpZWxkU3JjIiwicmVZaWVsZERlc3QiLCJyb290RWxzIiwidHIiLCJ0aCIsInRkIiwiY29sIiwidGJsVGFncyIsInRlbXBsIiwiaHRtbCIsInRvTG93ZXJDYXNlIiwibWtFbCIsInJlcGxhY2VZaWVsZCIsInNwZWNpYWxUYWdzIiwiaW5uZXJIVE1MIiwic3R1YiIsInNlbGVjdCIsInBhcmVudCIsImZpcnN0Q2hpbGQiLCJzZWxlY3RlZEluZGV4IiwidG5hbWUiLCJjaGlsZEVsZW1lbnRDb3VudCIsInJlZiIsInRleHQiLCJkZWYiLCJta2l0ZW0iLCJpdGVtIiwidW5tb3VudFJlZHVuZGFudCIsIml0ZW1zIiwidGFncyIsInVubW91bnQiLCJtb3ZlTmVzdGVkVGFncyIsImNoaWxkIiwia2V5cyIsImZvckVhY2giLCJ0YWciLCJpc0FycmF5IiwiZWFjaCIsIm1vdmVDaGlsZFRhZyIsImFkZFZpcnR1YWwiLCJfcm9vdCIsInNpYiIsIl92aXJ0cyIsIm5leHRTaWJsaW5nIiwiaW5zZXJ0QmVmb3JlIiwiYXBwZW5kQ2hpbGQiLCJtb3ZlVmlydHVhbCIsImxlbiIsIl9lYWNoIiwiZG9tIiwicmVtQXR0ciIsIm11c3RSZW9yZGVyIiwiZ2V0QXR0ciIsImdldFRhZ05hbWUiLCJpbXBsIiwib3V0ZXJIVE1MIiwidXNlUm9vdCIsImNyZWF0ZVRleHROb2RlIiwiZ2V0VGFnIiwiaXNPcHRpb24iLCJvbGRJdGVtcyIsImhhc0tleXMiLCJpc1ZpcnR1YWwiLCJyZW1vdmVDaGlsZCIsImZyYWciLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwibWFwIiwiaXRlbXNMZW5ndGgiLCJfbXVzdFJlb3JkZXIiLCJvbGRQb3MiLCJUYWciLCJpc0xvb3AiLCJoYXNJbXBsIiwiY2xvbmVOb2RlIiwibW91bnQiLCJ1cGRhdGUiLCJjaGlsZE5vZGVzIiwiX2l0ZW0iLCJzaSIsIm9wIiwib3B0aW9ucyIsInNlbGVjdGVkIiwiX19zZWxlY3RlZCIsInN0eWxlTWFuYWdlciIsIl9yaW90IiwiYWRkIiwiaW5qZWN0Iiwic3R5bGVOb2RlIiwibmV3Tm9kZSIsInNldEF0dHIiLCJ1c2VyTm9kZSIsImlkIiwicmVwbGFjZUNoaWxkIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJjc3NUZXh0UHJvcCIsInN0eWxlU2hlZXQiLCJzdHlsZXNUb0luamVjdCIsImNzcyIsImNzc1RleHQiLCJwYXJzZU5hbWVkRWxlbWVudHMiLCJjaGlsZFRhZ3MiLCJmb3JjZVBhcnNpbmdOYW1lZCIsIndhbGsiLCJub2RlVHlwZSIsImluaXRDaGlsZFRhZyIsInNldE5hbWVkIiwicGFyc2VFeHByZXNzaW9ucyIsImV4cHJlc3Npb25zIiwiYWRkRXhwciIsImV4dHJhIiwiZXh0ZW5kIiwidHlwZSIsImF0dHIiLCJub2RlVmFsdWUiLCJhdHRyaWJ1dGVzIiwiYm9vbCIsImNvbmYiLCJzZWxmIiwib3B0cyIsImluaGVyaXQiLCJjbGVhblVwRGF0YSIsImltcGxBdHRyIiwicHJvcHNJblN5bmNXaXRoUGFyZW50IiwiX3RhZyIsImlzTW91bnRlZCIsInVwZGF0ZU9wdHMiLCJ0b0NhbWVsIiwibm9ybWFsaXplRGF0YSIsImlzV3JpdGFibGUiLCJpbmhlcml0RnJvbVBhcmVudCIsIm11c3RTeW5jIiwiY29udGFpbnMiLCJpc0luaGVyaXRlZCIsImlzT2JqZWN0IiwickFGIiwibWl4IiwiaW5zdGFuY2UiLCJtaXhpbiIsImlzRnVuY3Rpb24iLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiaW5pdCIsImdsb2JhbE1peGluIiwidG9nZ2xlIiwiYXR0cnMiLCJ3YWxrQXR0cmlidXRlcyIsImlzSW5TdHViIiwia2VlcFJvb3RUYWciLCJwdGFnIiwidGFnSW5kZXgiLCJnZXRJbW1lZGlhdGVDdXN0b21QYXJlbnRUYWciLCJvbkNoaWxkVXBkYXRlIiwiaXNNb3VudCIsImV2dCIsInNldEV2ZW50SGFuZGxlciIsImhhbmRsZXIiLCJfcGFyZW50IiwiZXZlbnQiLCJjdXJyZW50VGFyZ2V0Iiwic3JjRWxlbWVudCIsImNoYXJDb2RlIiwia2V5Q29kZSIsInJldHVyblZhbHVlIiwicHJldmVudFVwZGF0ZSIsImluc2VydFRvIiwibm9kZSIsImJlZm9yZSIsImF0dHJOYW1lIiwicmVtb3ZlIiwiaW5TdHViIiwic3R5bGUiLCJkaXNwbGF5Iiwic3RhcnRzV2l0aCIsImVscyIsInJlbW92ZUF0dHJpYnV0ZSIsInN0cmluZyIsImMiLCJ0b1VwcGVyQ2FzZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsImFkZENoaWxkVGFnIiwiY2FjaGVkVGFnIiwibmV3UG9zIiwibmFtZWRUYWciLCJvYmoiLCJhIiwicHJvcHMiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJjcmVhdGVFbGVtZW50IiwiJCQiLCJzZWxlY3RvciIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJxdWVyeVNlbGVjdG9yIiwiQ2hpbGQiLCJnZXROYW1lZEtleSIsImlzQXJyIiwidyIsInJhZiIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsIm1velJlcXVlc3RBbmltYXRpb25GcmFtZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImxhc3RUaW1lIiwibm93dGltZSIsIkRhdGUiLCJub3ciLCJ0aW1lb3V0IiwiTWF0aCIsIm1heCIsIm1vdW50VG8iLCJfaW5uZXJIVE1MIiwidXRpbCIsIm1peGlucyIsInRhZzIiLCJhbGxUYWdzIiwiYWRkUmlvdFRhZ3MiLCJzZWxlY3RBbGxUYWdzIiwicHVzaFRhZ3MiLCJyaW90VGFnIiwibm9kZUxpc3QiLCJfZWwiLCJleHBvcnRzIiwibW9kdWxlIiwiZGVmaW5lIiwiYW1kIiwicmVmZXIiLCJyZXF1aXJlIiwiUmVmIiwic3RhdGUiLCJtZXRob2QiLCJyZWYxIiwid3JhcHBlciIsImNsb25lIiwiaXNOdW1iZXIiLCJfdmFsdWUiLCJrZXkxIiwiX211dGF0ZSIsInByZXYiLCJuZXh0IiwicHJvcCIsIlN0cmluZyIsImlzIiwiZGVlcCIsImNvcHkiLCJjb3B5X2lzX2FycmF5IiwiaGFzaCIsIm9ialByb3RvIiwib3ducyIsImhhc093blByb3BlcnR5IiwidG9TdHIiLCJ0b1N0cmluZyIsInN5bWJvbFZhbHVlT2YiLCJTeW1ib2wiLCJ2YWx1ZU9mIiwiaXNBY3R1YWxOYU4iLCJOT05fSE9TVF9UWVBFUyIsIm51bWJlciIsImJhc2U2NFJlZ2V4IiwiaGV4UmVnZXgiLCJkZWZpbmVkIiwiZW1wdHkiLCJlcXVhbCIsIm90aGVyIiwiZ2V0VGltZSIsImhvc3RlZCIsImhvc3QiLCJjb25zdHJ1Y3RvciIsIm5pbCIsInVuZGVmIiwiaXNTdGFuZGFyZEFyZ3VtZW50cyIsImlzT2xkQXJndW1lbnRzIiwiYXJyYXlsaWtlIiwib2JqZWN0IiwiY2FsbGVlIiwiaXNGaW5pdGUiLCJCb29sZWFuIiwiTnVtYmVyIiwiZGF0ZSIsImVsZW1lbnQiLCJIVE1MRWxlbWVudCIsImVycm9yIiwiaXNBbGVydCIsImFsZXJ0IiwiaW5maW5pdGUiLCJJbmZpbml0eSIsImRlY2ltYWwiLCJkaXZpc2libGVCeSIsIm4iLCJpc0RpdmlkZW5kSW5maW5pdGUiLCJpc0Rpdmlzb3JJbmZpbml0ZSIsImlzTm9uWmVyb051bWJlciIsImludGVnZXIiLCJtYXhpbXVtIiwib3RoZXJzIiwiVHlwZUVycm9yIiwibWluaW11bSIsIm5hbiIsImV2ZW4iLCJvZGQiLCJnZSIsImd0IiwibGUiLCJsdCIsIndpdGhpbiIsImZpbmlzaCIsImlzQW55SW5maW5pdGUiLCJzZXRJbnRlcnZhbCIsInJlZ2V4cCIsImJhc2U2NCIsImhleCIsInN5bWJvbCIsInR5cGVPZiIsIm51bSIsImlzQnVmZmVyIiwia2luZE9mIiwiQnVmZmVyIiwiX2lzQnVmZmVyIiwieCIsInN0clZhbHVlIiwidHJ5U3RyaW5nT2JqZWN0Iiwic3RyQ2xhc3MiLCJoYXNUb1N0cmluZ1RhZyIsInRvU3RyaW5nVGFnIiwiRGFzaGJvYXJkIiwiTG9naW4iLCJyZWdpc3RlciIsIkRhaXNobyIsIlZpZXciLCJoYXNQcm9wIiwiY3RvciIsIl9fc3VwZXJfXyIsIlZpZXdzIiwic3VwZXJDbGFzcyIsIkNyb3dkQ29udHJvbCIsInJlc3VsdHMiLCJDcm93ZHN0YXJ0IiwiQ3Jvd2Rjb250cm9sIiwiRm9ybSIsIklucHV0IiwiUHJvbWlzZSIsImlucHV0aWZ5Iiwic2V0dGxlIiwiY29uZmlncyIsImlucHV0cyIsImluaXRJbnB1dHMiLCJpbnB1dCIsInJlc3VsdHMxIiwic3VibWl0IiwicFJlZiIsInBzIiwidGhlbiIsIl90aGlzIiwicmVzdWx0IiwiaXNGdWxmaWxsZWQiLCJfc3VibWl0IiwiY29sbGFwc2VQcm90b3R5cGUiLCJvYmplY3RBc3NpZ24iLCJzZXRQcm90b3R5cGVPZiIsIm1peGluUHJvcGVydGllcyIsInNldFByb3RvT2YiLCJwcm90byIsIl9fcHJvdG9fXyIsImNvbGxhcHNlIiwicGFyZW50UHJvdG8iLCJnZXRQcm90b3R5cGVPZiIsIm5ld1Byb3RvIiwiYmVmb3JlSW5pdCIsIm9sZEZuIiwicHJvcElzRW51bWVyYWJsZSIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwidG9PYmplY3QiLCJhc3NpZ24iLCJmcm9tIiwidG8iLCJzeW1ib2xzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwiY29uZmlybSIsInByb21wdCIsImlzUmVmIiwiY29uZmlnIiwiZm4xIiwibWlkZGxld2FyZSIsIm1pZGRsZXdhcmVGbiIsInZhbGlkYXRlIiwicmVzb2x2ZSIsImxlbjEiLCJQcm9taXNlSW5zcGVjdGlvbiIsInN1cHByZXNzVW5jYXVnaHRSZWplY3Rpb25FcnJvciIsInJlYXNvbiIsImlzUmVqZWN0ZWQiLCJyZWZsZWN0IiwicHJvbWlzZSIsInJlamVjdCIsInByb21pc2VzIiwiYWxsIiwiY2FsbGJhY2siLCJ5IiwidSIsImYiLCJNdXRhdGlvbk9ic2VydmVyIiwib2JzZXJ2ZSIsInNldEltbWVkaWF0ZSIsImNvbnNvbGUiLCJsb2ciLCJzdGFjayIsImwiLCJab3VzYW4iLCJzb29uIiwicHJvbWlzZVJlc3VsdHMiLCJwcm9taXNlUmVzdWx0IiwiY2F0Y2giLCJyZXR1cm5zIiwidGhyb3dzIiwiZXJyb3JNZXNzYWdlIiwiZXJyb3JIdG1sIiwiZ2V0VmFsdWUiLCJjaGFuZ2UiLCJjbGVhckVycm9yIiwibWVzc2FnZSIsImNoYW5nZWQiLCJYaHIiLCJwYWdlIiwidXJsRm9yIiwiZmlsZSIsImJhc2VQYXRoIiwibW9kdWxlRGVmaW5pdGlvbnMiLCJtb2R1bGVzUmVxdWlyZWQiLCJtb2R1bGVzIiwibW9kdWxlTGlzdCIsInJlbmRlckVsZW1lbnQiLCJtb2R1bGVzVXJsIiwidXJsIiwic2VuZCIsInJlcyIsInJlc3BvbnNlVGV4dCIsInNldFJlbmRlckVsZW1lbnQiLCJsb2FkIiwiZGVmYXVsdE1vZHVsZSIsIm1vZHVsZVJlcXVpcmVkIiwidGltZW91dElkIiwid2FpdHMiLCJkZWZpbml0aW9uIiwianMiLCJyb3V0ZXMiLCJtb2R1bGVJbnN0YW5jZSIsInJlZjIiLCJyZWYzIiwiYWN0aXZlTW9kdWxlSW5zdGFuY2UiLCJ1bmxvYWQiLCJhY3RpdmVQYWdlSW5zdGFuY2UiLCJyZW5kZXIiLCJfZ2V0TW9kdWxlIiwibW9kdWxlTmFtZSIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiYXN5bmMiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiaGVhZGVyIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJfaGFuZGxlRXJyb3IiLCJfeGhyIiwib25sb2FkIiwiX2RldGFjaFdpbmRvd1VubG9hZCIsIl9nZXRSZXNwb25zZVRleHQiLCJfZXJyb3IiLCJfZ2V0UmVzcG9uc2VVcmwiLCJzdGF0dXMiLCJzdGF0dXNUZXh0IiwiX2dldEhlYWRlcnMiLCJvbmVycm9yIiwib250aW1lb3V0Iiwib25hYm9ydCIsIl9hdHRhY2hXaW5kb3dVbmxvYWQiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsImdldFhIUiIsIl91bmxvYWRIYW5kbGVyIiwiX2hhbmRsZVdpbmRvd1VubG9hZCIsImF0dGFjaEV2ZW50IiwiZGV0YWNoRXZlbnQiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJnZXRSZXNwb25zZUhlYWRlciIsIkpTT04iLCJyZXNwb25zZVVSTCIsImFib3J0Iiwicm93IiwibGVmdCIsInJpZ2h0IiwiaXRlcmF0b3IiLCJjb250ZXh0IiwiZm9yRWFjaEFycmF5IiwiZm9yRWFjaFN0cmluZyIsImZvckVhY2hPYmplY3QiLCJjaGFyQXQiLCJwYXRodG9SZWdleHAiLCJkaXNwYXRjaCIsImRlY29kZVVSTENvbXBvbmVudHMiLCJydW5uaW5nIiwiaGFzaGJhbmciLCJwcmV2Q29udGV4dCIsIlJvdXRlIiwiZXhpdHMiLCJwb3BzdGF0ZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbnBvcHN0YXRlIiwib25jbGljayIsInN1YnN0ciIsInNlYXJjaCIsInBhdGhuYW1lIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInNob3ciLCJDb250ZXh0IiwiaGFuZGxlZCIsImJhY2siLCJyZWRpcmVjdCIsInNhdmUiLCJuZXh0RXhpdCIsIm5leHRFbnRlciIsInVuaGFuZGxlZCIsImNhbm9uaWNhbFBhdGgiLCJleGl0IiwiZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudCIsImRlY29kZVVSSUNvbXBvbmVudCIsInF1ZXJ5c3RyaW5nIiwicGFyYW1zIiwicXNJbmRleCIsImxvYWRlZCIsImhhc0F0dHJpYnV0ZSIsImxpbmsiLCJzYW1lT3JpZ2luIiwicHJvY2VzcyIsIm9yaWciLCJidXR0b24iLCJvcmlnaW4iLCJwcm90b2NvbCIsImhvc3RuYW1lIiwicG9ydCIsImlzYXJyYXkiLCJwYXRoVG9SZWdleHAiLCJjb21waWxlIiwidG9rZW5zVG9GdW5jdGlvbiIsInRva2Vuc1RvUmVnRXhwIiwiUEFUSF9SRUdFWFAiLCJ0b2tlbnMiLCJlc2NhcGVkIiwib2Zmc2V0IiwicHJlZml4IiwiY2FwdHVyZSIsImdyb3VwIiwic3VmZml4IiwiYXN0ZXJpc2siLCJyZXBlYXQiLCJvcHRpb25hbCIsImRlbGltaXRlciIsInBhdHRlcm4iLCJlc2NhcGVHcm91cCIsIm1hdGNoZXMiLCJ0b2tlbiIsInNlZ21lbnQiLCJlbmNvZGVVUklDb21wb25lbnQiLCJlc2NhcGVTdHJpbmciLCJhdHRhY2hLZXlzIiwiZmxhZ3MiLCJzZW5zaXRpdmUiLCJyZWdleHBUb1JlZ2V4cCIsImdyb3VwcyIsImFycmF5VG9SZWdleHAiLCJzdHJpbmdUb1JlZ2V4cCIsInN0cmljdCIsImVuZCIsImxhc3RUb2tlbiIsImVuZHNXaXRoU2xhc2giLCJFdmVudHMiLCJMb2dpbkZvcm0iLCJpc0VtYWlsIiwiaXNQYXNzd29yZCIsImlzUmVxdWlyZWQiLCJjbGllbnRfaWQiLCJncmFudF90eXBlIiwiY2xpZW50Iiwib2F1dGgiLCJhdXRoIiwiTG9naW5TdWNjZXNzIiwiTG9naW5GYWlsZWQiLCJlbWFpbFJlIiwibWF0Y2hlc1Bhc3N3b3JkIiwic3BsaXROYW1lIiwidmVuZG9ycyIsImNhZiIsImxhc3QiLCJxdWV1ZSIsImZyYW1lRHVyYXRpb24iLCJfbm93IiwiY3AiLCJjYW5jZWxsZWQiLCJyb3VuZCIsImhhbmRsZSIsImNhbmNlbCIsInBvbHlmaWxsIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJnZXROYW5vU2Vjb25kcyIsImhydGltZSIsImxvYWRUaW1lIiwicGVyZm9ybWFuY2UiLCJociIsIkNoYW5nZSIsIkNoYW5nZVN1Y2Nlc3MiLCJDaGFuZ2VGYWlsZWQiLCJDb250cm9sIiwiVGV4dCIsInNjcm9sbGluZyIsImxvb2t1cCIsIkRPTUV4Y2VwdGlvbiIsImFuaW1hdGUiLCJzY3JvbGxUb3AiLCJ0b3AiLCJoZWlnaHQiLCJjb21wbGV0ZSIsImR1cmF0aW9uIiwicGxhY2Vob2xkZXIiLCJmb3JtRWxlbWVudCIsImhpZGVQbGFjZWhvbGRlck9uRm9jdXMiLCJ1bmZvY3VzT25BbkVsZW1lbnQiLCJfcGxhY2Vob2xkZXJlZCIsImNvb2tpZXMiLCJzdG9yZSIsImVuYWJsZWQiLCJzdHJpbmdpZnkiLCJjbGVhciIsImtzIiwiZXhwaXJlIiwiZmFjdG9yeSIsImxvY2FsU3RvcmFnZU5hbWUiLCJzY3JpcHRUYWciLCJzdG9yYWdlIiwiZGlzYWJsZWQiLCJkZWZhdWx0VmFsIiwiaGFzIiwidHJhbnNhY3QiLCJ0cmFuc2FjdGlvbkZuIiwiZ2V0QWxsIiwic2VyaWFsaXplIiwiZGVzZXJpYWxpemUiLCJpc0xvY2FsU3RvcmFnZU5hbWVTdXBwb3J0ZWQiLCJzZXRJdGVtIiwiZ2V0SXRlbSIsInJlbW92ZUl0ZW0iLCJyZXQiLCJkb2N1bWVudEVsZW1lbnQiLCJhZGRCZWhhdmlvciIsInN0b3JhZ2VPd25lciIsInN0b3JhZ2VDb250YWluZXIiLCJBY3RpdmVYT2JqZWN0Iiwid3JpdGUiLCJjbG9zZSIsImZyYW1lcyIsImJvZHkiLCJ3aXRoSUVTdG9yYWdlIiwic3RvcmVGdW5jdGlvbiIsInVuc2hpZnQiLCJmb3JiaWRkZW5DaGFyc1JlZ2V4IiwiaWVLZXlGaXgiLCJYTUxEb2N1bWVudCIsInRlc3RLZXkiLCJDb29raWVzIiwiX2RvY3VtZW50IiwiX2NhY2hlS2V5UHJlZml4IiwiX21heEV4cGlyZURhdGUiLCJzZWN1cmUiLCJfY2FjaGVkRG9jdW1lbnRDb29raWUiLCJjb29raWUiLCJfcmVuZXdDYWNoZSIsIl9nZXRFeHRlbmRlZE9wdGlvbnMiLCJleHBpcmVzIiwiX2dldEV4cGlyZXNEYXRlIiwiX2dlbmVyYXRlQ29va2llU3RyaW5nIiwiZG9tYWluIiwiX2lzVmFsaWREYXRlIiwiaXNOYU4iLCJjb29raWVTdHJpbmciLCJ0b1VUQ1N0cmluZyIsIl9nZXRDYWNoZUZyb21TdHJpbmciLCJkb2N1bWVudENvb2tpZSIsImNvb2tpZUNhY2hlIiwiY29va2llc0FycmF5IiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImRlY29kZWRLZXkiLCJfYXJlRW5hYmxlZCIsImFyZUVuYWJsZWQiLCJjb29raWVzRXhwb3J0IiwiQXBpIiwiQ2xpZW50IiwiSGFuem8iLCJDTElFTlQiLCJCTFVFUFJJTlRTIiwibmV3RXJyb3IiLCJzdGF0dXNPayIsImJsdWVwcmludHMiLCJkZWJ1ZyIsImVuZHBvaW50IiwiYWRkQmx1ZXByaW50cyIsImFwaSIsImV4cGVjdHMiLCJ1c2VDdXN0b21lclRva2VuIiwiZ2V0Q3VzdG9tZXJUb2tlbiIsInJlcXVlc3QiLCJzZXRLZXkiLCJzZXRDdXN0b21lclRva2VuIiwiZGVsZXRlQ3VzdG9tZXJUb2tlbiIsInNldFN0b3JlIiwic3RvcmVJZCIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJyZWY0IiwicmVxIiwidXBkYXRlUXVlcnkiLCJzZXBhcmF0b3IiLCJmb3JtYXREYXRhIiwiZW5jb2RlIiwiWGhyQ2xpZW50Iiwic2Vzc2lvbk5hbWUiLCJzZXRFbmRwb2ludCIsImdldEtleSIsIktFWSIsInNlc3Npb24iLCJnZXRKU09OIiwiY3VzdG9tZXJUb2tlbiIsImdldFVybCIsImJsdWVwcmludCIsIl9PbGRDb29raWVzIiwibm9Db25mbGljdCIsImNvbnZlcnRlciIsInNldE1pbGxpc2Vjb25kcyIsImdldE1pbGxpc2Vjb25kcyIsImVzY2FwZSIsInJkZWNvZGUiLCJyZWFkIiwianNvbiIsIndpdGhDb252ZXJ0ZXIiLCJieUlkIiwiY3JlYXRlQmx1ZXByaW50IiwibW9kZWwiLCJtb2RlbHMiLCJzdG9yZVByZWZpeGVkIiwidXNlck1vZGVscyIsImFjY291bnQiLCJleGlzdHMiLCJlbWFpbCIsImVuYWJsZSIsInRva2VuSWQiLCJsb2dpbiIsImxvZ291dCIsInJlc2V0IiwiY2hlY2tvdXQiLCJhdXRob3JpemUiLCJvcmRlcklkIiwiY2hhcmdlIiwicGF5cGFsIiwicmVmZXJyZXIiLCJzcCIsImNvZGUiLCJzbHVnIiwic2t1IiwiQ29udHJvbHMiLCJkIiwiYWNjZXNzX3Rva2VuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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