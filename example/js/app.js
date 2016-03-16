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
  // source: example/js/views/index.coffee
  require.define('./views', function (module, exports, __dirname, __filename, process) {
    module.exports = {
      Dashboard: require('./views/dashboard'),
      register: function () {
        return this.Dashboard.register()
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
            var fn, i, len, module, moduleRequired, modules, ref, timeoutId, waits;
            timeoutId = setTimeout(function () {
              return reject(new Error('Loading Timed Out'))
            }, 10000);
            waits = 0;
            _this.modules = modules = {};
            ref = _this.modulesRequired;
            fn = function (module, modules) {
              var m;
              m = {};
              m.definition = module;
              require(module.name + '-v' + module.version + '/bundle.js', function (js) {
                var fn1, p, r, ref1;
                m.name = js.name;
                m.js = js;
                waits--;
                clearTimeout(timeoutId);
                modules[module.name] = m;
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
                  return resolve(modules)
                }
              });
              return m.css = module.name + '-v' + module.version + '/bundle.css'
            };
            for (i = 0, len = ref.length; i < len; i++) {
              moduleRequired = ref[i];
              module = _this._getModule(moduleRequired);
              waits++;
              fn(module, modules)
            }
            if (waits === 0) {
              return p.resolve(_this.modules)
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
    module.exports = '<header>HEADER</header>\n\n<nav>\n  <span>NAVIGATION</span>\n  <ul>\n    <li each="{ k, v in modules }" onclick="{ route(k) }">{ v.name }</li>\n  </ul>\n</nav>\n\n<section>\n</section>\n\n<footer>FOOTER</footer>\n\n'
  });
  // source: example/js/app.coffee
  require.define('app', function (module, exports, __dirname, __filename, process) {
    var Views, riot;
    if (typeof window !== 'undefined' && window !== null) {
      riot = require('riot/riot');
      window.riot = riot;
      Views = require('./views');
      window.Dashboard = { Views: Views };
      Views.register();
      Daisho.init('/example', '/example/fixtures/modules.json').then(function () {
        return Daisho.load([
          'home',
          'user'
        ])
      }).then(function (modules) {
        return riot.mount('dashboard', { modules: modules })
      }).then(function () {
        Daisho.setRenderElement($('dashboard > section')[0]);
        return Daisho.route('home')
      })
    }
  });
  require('app')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yaW90L3Jpb3QuanMiLCJ2aWV3cy9pbmRleC5jb2ZmZWUiLCJ2aWV3cy9kYXNoYm9hcmQuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY3Jvd2Rjb250cm9sL2xpYi9yaW90LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvdmlld3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY3Jvd2Rjb250cm9sL2xpYi92aWV3cy9mb3JtLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvdmlld3Mvdmlldy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvdmlld3MvaW5wdXRpZnkuanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsIm5vZGVfbW9kdWxlcy9yZWZlcmVudGlhbC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVmZXJlbnRpYWwvbGliL3JlZmVyLmpzIiwibm9kZV9tb2R1bGVzL3JlZmVyZW50aWFsL2xpYi9yZWYuanMiLCJub2RlX21vZHVsZXMvbm9kZS5leHRlbmQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbm9kZS5leHRlbmQvbGliL2V4dGVuZC5qcyIsIm5vZGVfbW9kdWxlcy9pcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1hcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1udW1iZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMva2luZC1vZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1idWZmZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtb2JqZWN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLXN0cmluZy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9taXNlLXNldHRsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9taXNlLXNldHRsZS9saWIvcHJvbWlzZS1zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvY3Jvd2Rjb250cm9sL2xpYi92aWV3cy9pbnB1dC5qcyIsIlVzZXJzL2R0YWkvd29yay9oYW56by9kYWlzaG8vc3JjL2luZGV4LmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhZ2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGF0aC10by1yZWdleHAvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsInRlbXBsYXRlcy9kYXNoYm9hcmQuaHRtbCIsImFwcC5jb2ZmZWUiXSwibmFtZXMiOlsid2luZG93IiwidW5kZWZpbmVkIiwicmlvdCIsInZlcnNpb24iLCJzZXR0aW5ncyIsIl9fdWlkIiwiX192aXJ0dWFsRG9tIiwiX190YWdJbXBsIiwiR0xPQkFMX01JWElOIiwiUklPVF9QUkVGSVgiLCJSSU9UX1RBRyIsIlJJT1RfVEFHX0lTIiwiVF9TVFJJTkciLCJUX09CSkVDVCIsIlRfVU5ERUYiLCJUX0JPT0wiLCJUX0ZVTkNUSU9OIiwiU1BFQ0lBTF9UQUdTX1JFR0VYIiwiUkVTRVJWRURfV09SRFNfQkxBQ0tMSVNUIiwiSUVfVkVSU0lPTiIsImRvY3VtZW50IiwiZG9jdW1lbnRNb2RlIiwib2JzZXJ2YWJsZSIsImVsIiwiY2FsbGJhY2tzIiwic2xpY2UiLCJBcnJheSIsInByb3RvdHlwZSIsIm9uRWFjaEV2ZW50IiwiZSIsImZuIiwicmVwbGFjZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnRpZXMiLCJvbiIsInZhbHVlIiwiZXZlbnRzIiwibmFtZSIsInBvcyIsInB1c2giLCJ0eXBlZCIsImVudW1lcmFibGUiLCJ3cml0YWJsZSIsImNvbmZpZ3VyYWJsZSIsIm9mZiIsImFyciIsImkiLCJjYiIsInNwbGljZSIsIm9uZSIsImFwcGx5IiwiYXJndW1lbnRzIiwidHJpZ2dlciIsImFyZ2xlbiIsImxlbmd0aCIsImFyZ3MiLCJmbnMiLCJjYWxsIiwiYnVzeSIsImNvbmNhdCIsIlJFX09SSUdJTiIsIkVWRU5UX0xJU1RFTkVSIiwiUkVNT1ZFX0VWRU5UX0xJU1RFTkVSIiwiQUREX0VWRU5UX0xJU1RFTkVSIiwiSEFTX0FUVFJJQlVURSIsIlJFUExBQ0UiLCJQT1BTVEFURSIsIkhBU0hDSEFOR0UiLCJUUklHR0VSIiwiTUFYX0VNSVRfU1RBQ0tfTEVWRUwiLCJ3aW4iLCJkb2MiLCJoaXN0IiwiaGlzdG9yeSIsImxvYyIsImxvY2F0aW9uIiwicHJvdCIsIlJvdXRlciIsImNsaWNrRXZlbnQiLCJvbnRvdWNoc3RhcnQiLCJzdGFydGVkIiwiY2VudHJhbCIsInJvdXRlRm91bmQiLCJkZWJvdW5jZWRFbWl0IiwiYmFzZSIsImN1cnJlbnQiLCJwYXJzZXIiLCJzZWNvbmRQYXJzZXIiLCJlbWl0U3RhY2siLCJlbWl0U3RhY2tMZXZlbCIsIkRFRkFVTFRfUEFSU0VSIiwicGF0aCIsInNwbGl0IiwiREVGQVVMVF9TRUNPTkRfUEFSU0VSIiwiZmlsdGVyIiwicmUiLCJSZWdFeHAiLCJtYXRjaCIsImRlYm91bmNlIiwiZGVsYXkiLCJ0IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsInN0YXJ0IiwiYXV0b0V4ZWMiLCJlbWl0IiwiY2xpY2siLCIkIiwicyIsImJpbmQiLCJub3JtYWxpemUiLCJpc1N0cmluZyIsInN0ciIsImdldFBhdGhGcm9tUm9vdCIsImhyZWYiLCJnZXRQYXRoRnJvbUJhc2UiLCJmb3JjZSIsImlzUm9vdCIsInNoaWZ0Iiwid2hpY2giLCJtZXRhS2V5IiwiY3RybEtleSIsInNoaWZ0S2V5IiwiZGVmYXVsdFByZXZlbnRlZCIsInRhcmdldCIsIm5vZGVOYW1lIiwicGFyZW50Tm9kZSIsImluZGV4T2YiLCJnbyIsInRpdGxlIiwicHJldmVudERlZmF1bHQiLCJzaG91bGRSZXBsYWNlIiwicmVwbGFjZVN0YXRlIiwicHVzaFN0YXRlIiwibSIsImZpcnN0Iiwic2Vjb25kIiwidGhpcmQiLCJyIiwic29tZSIsImFjdGlvbiIsIm1haW5Sb3V0ZXIiLCJyb3V0ZSIsImNyZWF0ZSIsIm5ld1N1YlJvdXRlciIsInN0b3AiLCJhcmciLCJleGVjIiwiZm4yIiwicXVlcnkiLCJxIiwiXyIsImsiLCJ2IiwicmVhZHlTdGF0ZSIsImJyYWNrZXRzIiwiVU5ERUYiLCJSRUdMT0IiLCJSX01MQ09NTVMiLCJSX1NUUklOR1MiLCJTX1FCTE9DS1MiLCJzb3VyY2UiLCJGSU5EQlJBQ0VTIiwiREVGQVVMVCIsIl9wYWlycyIsImNhY2hlZEJyYWNrZXRzIiwiX3JlZ2V4IiwiX2NhY2hlIiwiX3NldHRpbmdzIiwiX2xvb3BiYWNrIiwiX3Jld3JpdGUiLCJicCIsImdsb2JhbCIsIl9jcmVhdGUiLCJwYWlyIiwidGVzdCIsIkVycm9yIiwiX2JyYWNrZXRzIiwicmVPcklkeCIsInRtcGwiLCJfYnAiLCJwYXJ0cyIsImlzZXhwciIsImxhc3RJbmRleCIsImluZGV4Iiwic2tpcEJyYWNlcyIsInVuZXNjYXBlU3RyIiwiY2giLCJpeCIsInJlY2NoIiwiaGFzRXhwciIsImxvb3BLZXlzIiwiZXhwciIsImtleSIsInZhbCIsInRyaW0iLCJoYXNSYXciLCJzcmMiLCJhcnJheSIsIl9yZXNldCIsIl9zZXRTZXR0aW5ncyIsIm8iLCJiIiwiZGVmaW5lUHJvcGVydHkiLCJzZXQiLCJnZXQiLCJfdG1wbCIsImRhdGEiLCJfbG9nRXJyIiwiaGF2ZVJhdyIsImVycm9ySGFuZGxlciIsImVyciIsImN0eCIsInJpb3REYXRhIiwidGFnTmFtZSIsInJvb3QiLCJfcmlvdF9pZCIsIl9nZXRUbXBsIiwiRnVuY3Rpb24iLCJSRV9RQkxPQ0siLCJSRV9RQk1BUksiLCJxc3RyIiwiaiIsImxpc3QiLCJfcGFyc2VFeHByIiwiam9pbiIsIlJFX0JSRU5EIiwiQ1NfSURFTlQiLCJhc1RleHQiLCJkaXYiLCJjbnQiLCJqc2IiLCJyaWdodENvbnRleHQiLCJfd3JhcEV4cHIiLCJtbSIsImx2IiwiaXIiLCJKU19DT05URVhUIiwiSlNfVkFSTkFNRSIsIkpTX05PUFJPUFMiLCJ0YiIsInAiLCJtdmFyIiwicGFyc2UiLCJta2RvbSIsIl9ta2RvbSIsInJlSGFzWWllbGQiLCJyZVlpZWxkQWxsIiwicmVZaWVsZFNyYyIsInJlWWllbGREZXN0Iiwicm9vdEVscyIsInRyIiwidGgiLCJ0ZCIsImNvbCIsInRibFRhZ3MiLCJ0ZW1wbCIsImh0bWwiLCJ0b0xvd2VyQ2FzZSIsIm1rRWwiLCJyZXBsYWNlWWllbGQiLCJzcGVjaWFsVGFncyIsImlubmVySFRNTCIsInN0dWIiLCJzZWxlY3QiLCJwYXJlbnQiLCJmaXJzdENoaWxkIiwic2VsZWN0ZWRJbmRleCIsInRuYW1lIiwiY2hpbGRFbGVtZW50Q291bnQiLCJyZWYiLCJ0ZXh0IiwiZGVmIiwibWtpdGVtIiwiaXRlbSIsInVubW91bnRSZWR1bmRhbnQiLCJpdGVtcyIsInRhZ3MiLCJ1bm1vdW50IiwibW92ZU5lc3RlZFRhZ3MiLCJjaGlsZCIsImtleXMiLCJmb3JFYWNoIiwidGFnIiwiaXNBcnJheSIsImVhY2giLCJtb3ZlQ2hpbGRUYWciLCJhZGRWaXJ0dWFsIiwiX3Jvb3QiLCJzaWIiLCJfdmlydHMiLCJuZXh0U2libGluZyIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwibW92ZVZpcnR1YWwiLCJsZW4iLCJfZWFjaCIsImRvbSIsInJlbUF0dHIiLCJtdXN0UmVvcmRlciIsImdldEF0dHIiLCJnZXRUYWdOYW1lIiwiaW1wbCIsIm91dGVySFRNTCIsInVzZVJvb3QiLCJjcmVhdGVUZXh0Tm9kZSIsImdldFRhZyIsImlzT3B0aW9uIiwib2xkSXRlbXMiLCJoYXNLZXlzIiwiaXNWaXJ0dWFsIiwicmVtb3ZlQ2hpbGQiLCJmcmFnIiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsIm1hcCIsIml0ZW1zTGVuZ3RoIiwiX211c3RSZW9yZGVyIiwib2xkUG9zIiwiVGFnIiwiaXNMb29wIiwiaGFzSW1wbCIsImNsb25lTm9kZSIsIm1vdW50IiwidXBkYXRlIiwiY2hpbGROb2RlcyIsIl9pdGVtIiwic2kiLCJvcCIsIm9wdGlvbnMiLCJzZWxlY3RlZCIsIl9fc2VsZWN0ZWQiLCJzdHlsZU1hbmFnZXIiLCJfcmlvdCIsImFkZCIsImluamVjdCIsInN0eWxlTm9kZSIsIm5ld05vZGUiLCJzZXRBdHRyIiwidXNlck5vZGUiLCJpZCIsInJlcGxhY2VDaGlsZCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiY3NzVGV4dFByb3AiLCJzdHlsZVNoZWV0Iiwic3R5bGVzVG9JbmplY3QiLCJjc3MiLCJjc3NUZXh0IiwicGFyc2VOYW1lZEVsZW1lbnRzIiwiY2hpbGRUYWdzIiwiZm9yY2VQYXJzaW5nTmFtZWQiLCJ3YWxrIiwibm9kZVR5cGUiLCJpbml0Q2hpbGRUYWciLCJzZXROYW1lZCIsInBhcnNlRXhwcmVzc2lvbnMiLCJleHByZXNzaW9ucyIsImFkZEV4cHIiLCJleHRyYSIsImV4dGVuZCIsInR5cGUiLCJhdHRyIiwibm9kZVZhbHVlIiwiYXR0cmlidXRlcyIsImJvb2wiLCJjb25mIiwic2VsZiIsIm9wdHMiLCJpbmhlcml0IiwiY2xlYW5VcERhdGEiLCJpbXBsQXR0ciIsInByb3BzSW5TeW5jV2l0aFBhcmVudCIsIl90YWciLCJpc01vdW50ZWQiLCJ1cGRhdGVPcHRzIiwidG9DYW1lbCIsIm5vcm1hbGl6ZURhdGEiLCJpc1dyaXRhYmxlIiwiaW5oZXJpdEZyb21QYXJlbnQiLCJtdXN0U3luYyIsImNvbnRhaW5zIiwiaXNJbmhlcml0ZWQiLCJpc09iamVjdCIsInJBRiIsIm1peCIsImluc3RhbmNlIiwibWl4aW4iLCJpc0Z1bmN0aW9uIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImluaXQiLCJnbG9iYWxNaXhpbiIsInRvZ2dsZSIsImF0dHJzIiwid2Fsa0F0dHJpYnV0ZXMiLCJpc0luU3R1YiIsImtlZXBSb290VGFnIiwicHRhZyIsInRhZ0luZGV4IiwiZ2V0SW1tZWRpYXRlQ3VzdG9tUGFyZW50VGFnIiwib25DaGlsZFVwZGF0ZSIsImlzTW91bnQiLCJldnQiLCJzZXRFdmVudEhhbmRsZXIiLCJoYW5kbGVyIiwiX3BhcmVudCIsImV2ZW50IiwiY3VycmVudFRhcmdldCIsInNyY0VsZW1lbnQiLCJjaGFyQ29kZSIsImtleUNvZGUiLCJyZXR1cm5WYWx1ZSIsInByZXZlbnRVcGRhdGUiLCJpbnNlcnRUbyIsIm5vZGUiLCJiZWZvcmUiLCJhdHRyTmFtZSIsInJlbW92ZSIsImluU3R1YiIsInN0eWxlIiwiZGlzcGxheSIsInN0YXJ0c1dpdGgiLCJlbHMiLCJyZW1vdmVBdHRyaWJ1dGUiLCJzdHJpbmciLCJjIiwidG9VcHBlckNhc2UiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJhZGRDaGlsZFRhZyIsImNhY2hlZFRhZyIsIm5ld1BvcyIsIm5hbWVkVGFnIiwib2JqIiwiYSIsInByb3BzIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiY3JlYXRlRWxlbWVudCIsIiQkIiwic2VsZWN0b3IiLCJxdWVyeVNlbGVjdG9yQWxsIiwicXVlcnlTZWxlY3RvciIsIkNoaWxkIiwiZ2V0TmFtZWRLZXkiLCJpc0FyciIsInciLCJyYWYiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJtb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJsYXN0VGltZSIsIm5vd3RpbWUiLCJEYXRlIiwibm93IiwidGltZW91dCIsIk1hdGgiLCJtYXgiLCJtb3VudFRvIiwiX2lubmVySFRNTCIsInV0aWwiLCJtaXhpbnMiLCJ0YWcyIiwiYWxsVGFncyIsImFkZFJpb3RUYWdzIiwic2VsZWN0QWxsVGFncyIsInB1c2hUYWdzIiwicmlvdFRhZyIsIm5vZGVMaXN0IiwiX2VsIiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsIkRhc2hib2FyZCIsInJlcXVpcmUiLCJyZWdpc3RlciIsIkRhaXNobyIsIlZpZXciLCJoYXNQcm9wIiwiY3RvciIsImNvbnN0cnVjdG9yIiwiX19zdXBlcl9fIiwiaGFzT3duUHJvcGVydHkiLCJWaWV3cyIsInN1cGVyQ2xhc3MiLCJDcm93ZENvbnRyb2wiLCJyZXN1bHRzIiwiQ3Jvd2RzdGFydCIsIkNyb3dkY29udHJvbCIsIkZvcm0iLCJJbnB1dCIsIlByb21pc2UiLCJpbnB1dGlmeSIsInNldHRsZSIsImNvbmZpZ3MiLCJpbnB1dHMiLCJpbml0SW5wdXRzIiwiaW5wdXQiLCJyZXN1bHRzMSIsInN1Ym1pdCIsInBSZWYiLCJwcyIsInRoZW4iLCJfdGhpcyIsInJlc3VsdCIsImlzRnVsZmlsbGVkIiwiX3N1Ym1pdCIsImNvbGxhcHNlUHJvdG90eXBlIiwib2JqZWN0QXNzaWduIiwic2V0UHJvdG90eXBlT2YiLCJtaXhpblByb3BlcnRpZXMiLCJzZXRQcm90b09mIiwicHJvdG8iLCJfX3Byb3RvX18iLCJwcm9wIiwiY29sbGFwc2UiLCJwYXJlbnRQcm90byIsImdldFByb3RvdHlwZU9mIiwibmV3UHJvdG8iLCJiZWZvcmVJbml0Iiwib2xkRm4iLCJwcm9wSXNFbnVtZXJhYmxlIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJ0b09iamVjdCIsIlR5cGVFcnJvciIsImFzc2lnbiIsImZyb20iLCJ0byIsInN5bWJvbHMiLCJnZXRPd25Qcm9wZXJ0eVN5bWJvbHMiLCJ0b1N0cmluZyIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsImlzUmVmIiwicmVmZXIiLCJjb25maWciLCJmbjEiLCJtaWRkbGV3YXJlIiwibWlkZGxld2FyZUZuIiwidmFsaWRhdGUiLCJyZXNvbHZlIiwibGVuMSIsIlByb21pc2VJbnNwZWN0aW9uIiwic3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yIiwic3RhdGUiLCJyZWFzb24iLCJpc1JlamVjdGVkIiwicmVmbGVjdCIsInByb21pc2UiLCJyZWplY3QiLCJwcm9taXNlcyIsImFsbCIsImNhbGxiYWNrIiwiZXJyb3IiLCJuIiwieSIsInUiLCJmIiwiTXV0YXRpb25PYnNlcnZlciIsIm9ic2VydmUiLCJzZXRJbW1lZGlhdGUiLCJjb25zb2xlIiwibG9nIiwic3RhY2siLCJsIiwiWm91c2FuIiwic29vbiIsIlJlZiIsIm1ldGhvZCIsInJlZjEiLCJ3cmFwcGVyIiwiY2xvbmUiLCJpc051bWJlciIsIl92YWx1ZSIsImtleTEiLCJfbXV0YXRlIiwicHJldiIsIm5leHQiLCJTdHJpbmciLCJpcyIsImRlZXAiLCJjb3B5IiwiY29weV9pc19hcnJheSIsImhhc2giLCJvYmpQcm90byIsIm93bnMiLCJ0b1N0ciIsInN5bWJvbFZhbHVlT2YiLCJTeW1ib2wiLCJ2YWx1ZU9mIiwiaXNBY3R1YWxOYU4iLCJOT05fSE9TVF9UWVBFUyIsIm51bWJlciIsImJhc2U2NFJlZ2V4IiwiaGV4UmVnZXgiLCJkZWZpbmVkIiwiZW1wdHkiLCJlcXVhbCIsIm90aGVyIiwiZ2V0VGltZSIsImhvc3RlZCIsImhvc3QiLCJuaWwiLCJ1bmRlZiIsImlzU3RhbmRhcmRBcmd1bWVudHMiLCJpc09sZEFyZ3VtZW50cyIsImFycmF5bGlrZSIsIm9iamVjdCIsImNhbGxlZSIsImlzRmluaXRlIiwiQm9vbGVhbiIsIk51bWJlciIsImRhdGUiLCJlbGVtZW50IiwiSFRNTEVsZW1lbnQiLCJpc0FsZXJ0IiwiaW5maW5pdGUiLCJJbmZpbml0eSIsImRlY2ltYWwiLCJkaXZpc2libGVCeSIsImlzRGl2aWRlbmRJbmZpbml0ZSIsImlzRGl2aXNvckluZmluaXRlIiwiaXNOb25aZXJvTnVtYmVyIiwiaW50ZWdlciIsIm1heGltdW0iLCJvdGhlcnMiLCJtaW5pbXVtIiwibmFuIiwiZXZlbiIsIm9kZCIsImdlIiwiZ3QiLCJsZSIsImx0Iiwid2l0aGluIiwiZmluaXNoIiwiaXNBbnlJbmZpbml0ZSIsInNldEludGVydmFsIiwicmVnZXhwIiwiYmFzZTY0IiwiaGV4Iiwic3ltYm9sIiwidHlwZU9mIiwibnVtIiwiaXNCdWZmZXIiLCJraW5kT2YiLCJCdWZmZXIiLCJfaXNCdWZmZXIiLCJ4Iiwic3RyVmFsdWUiLCJ0cnlTdHJpbmdPYmplY3QiLCJzdHJDbGFzcyIsImhhc1RvU3RyaW5nVGFnIiwidG9TdHJpbmdUYWciLCJwcm9taXNlUmVzdWx0cyIsInByb21pc2VSZXN1bHQiLCJjYXRjaCIsInJldHVybnMiLCJ0aHJvd3MiLCJlcnJvck1lc3NhZ2UiLCJlcnJvckh0bWwiLCJnZXRWYWx1ZSIsImNoYW5nZSIsImNsZWFyRXJyb3IiLCJtZXNzYWdlIiwiY2hhbmdlZCIsIlhociIsInBhZ2UiLCJ1cmxGb3IiLCJmaWxlIiwiYmFzZVBhdGgiLCJtb2R1bGVEZWZpbml0aW9ucyIsIm1vZHVsZXNSZXF1aXJlZCIsIm1vZHVsZXMiLCJyZW5kZXJFbGVtZW50IiwibW9kdWxlc1VybCIsInVybCIsInNlbmQiLCJyZXMiLCJyZXNwb25zZVRleHQiLCJzZXRSZW5kZXJFbGVtZW50IiwibG9hZCIsImRlZmF1bHRNb2R1bGUiLCJtb2R1bGVSZXF1aXJlZCIsInRpbWVvdXRJZCIsIndhaXRzIiwiZGVmaW5pdGlvbiIsImpzIiwicm91dGVzIiwibW9kdWxlSW5zdGFuY2UiLCJyZWYyIiwicmVmMyIsImFjdGl2ZU1vZHVsZUluc3RhbmNlIiwidW5sb2FkIiwiYWN0aXZlUGFnZUluc3RhbmNlIiwicmVuZGVyIiwiX2dldE1vZHVsZSIsIm1vZHVsZU5hbWUiLCJQYXJzZUhlYWRlcnMiLCJYTUxIdHRwUmVxdWVzdFByb21pc2UiLCJERUZBVUxUX0NPTlRFTlRfVFlQRSIsImRlZmF1bHRzIiwiaGVhZGVycyIsImFzeW5jIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsImhlYWRlciIsInhociIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJnZXRYSFIiLCJfdW5sb2FkSGFuZGxlciIsIl9oYW5kbGVXaW5kb3dVbmxvYWQiLCJhdHRhY2hFdmVudCIsImRldGFjaEV2ZW50IiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJKU09OIiwicmVzcG9uc2VVUkwiLCJhYm9ydCIsInJvdyIsImxlZnQiLCJyaWdodCIsIml0ZXJhdG9yIiwiY29udGV4dCIsImZvckVhY2hBcnJheSIsImZvckVhY2hTdHJpbmciLCJmb3JFYWNoT2JqZWN0IiwiY2hhckF0IiwicGF0aHRvUmVnZXhwIiwiZGlzcGF0Y2giLCJkZWNvZGVVUkxDb21wb25lbnRzIiwicnVubmluZyIsImhhc2hiYW5nIiwicHJldkNvbnRleHQiLCJSb3V0ZSIsImV4aXRzIiwicG9wc3RhdGUiLCJhZGRFdmVudExpc3RlbmVyIiwib25wb3BzdGF0ZSIsIm9uY2xpY2siLCJzdWJzdHIiLCJzZWFyY2giLCJwYXRobmFtZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJzaG93IiwiQ29udGV4dCIsImhhbmRsZWQiLCJiYWNrIiwicmVkaXJlY3QiLCJzYXZlIiwibmV4dEV4aXQiLCJuZXh0RW50ZXIiLCJ1bmhhbmRsZWQiLCJjYW5vbmljYWxQYXRoIiwiZXhpdCIsImRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQiLCJkZWNvZGVVUklDb21wb25lbnQiLCJxdWVyeXN0cmluZyIsInBhcmFtcyIsInFzSW5kZXgiLCJsb2FkZWQiLCJoYXNBdHRyaWJ1dGUiLCJsaW5rIiwic2FtZU9yaWdpbiIsInByb2Nlc3MiLCJvcmlnIiwiYnV0dG9uIiwib3JpZ2luIiwicHJvdG9jb2wiLCJob3N0bmFtZSIsInBvcnQiLCJpc2FycmF5IiwicGF0aFRvUmVnZXhwIiwiY29tcGlsZSIsInRva2Vuc1RvRnVuY3Rpb24iLCJ0b2tlbnNUb1JlZ0V4cCIsIlBBVEhfUkVHRVhQIiwidG9rZW5zIiwiZXNjYXBlZCIsIm9mZnNldCIsInByZWZpeCIsImNhcHR1cmUiLCJncm91cCIsInN1ZmZpeCIsImFzdGVyaXNrIiwicmVwZWF0Iiwib3B0aW9uYWwiLCJkZWxpbWl0ZXIiLCJwYXR0ZXJuIiwiZXNjYXBlR3JvdXAiLCJtYXRjaGVzIiwidG9rZW4iLCJzZWdtZW50IiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZXNjYXBlU3RyaW5nIiwiYXR0YWNoS2V5cyIsImZsYWdzIiwic2Vuc2l0aXZlIiwicmVnZXhwVG9SZWdleHAiLCJncm91cHMiLCJhcnJheVRvUmVnZXhwIiwic3RyaW5nVG9SZWdleHAiLCJzdHJpY3QiLCJlbmQiLCJsYXN0VG9rZW4iLCJlbmRzV2l0aFNsYXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFQTtBQUFBLEs7SUFBQyxDQUFDLFVBQVNBLE1BQVQsRUFBaUJDLFNBQWpCLEVBQTRCO0FBQUEsTUFDNUIsYUFENEI7QUFBQSxNQUU5QixJQUFJQyxJQUFBLEdBQU87QUFBQSxVQUFFQyxPQUFBLEVBQVMsU0FBWDtBQUFBLFVBQXNCQyxRQUFBLEVBQVUsRUFBaEM7QUFBQSxTQUFYO0FBQUEsUUFLRTtBQUFBO0FBQUE7QUFBQSxRQUFBQyxLQUFBLEdBQVEsQ0FMVjtBQUFBLFFBT0U7QUFBQSxRQUFBQyxZQUFBLEdBQWUsRUFQakI7QUFBQSxRQVNFO0FBQUEsUUFBQUMsU0FBQSxHQUFZLEVBVGQ7QUFBQSxRQWNFO0FBQUE7QUFBQTtBQUFBLFFBQUFDLFlBQUEsR0FBZSxnQkFkakI7QUFBQSxRQWlCRTtBQUFBLFFBQUFDLFdBQUEsR0FBYyxPQWpCaEIsRUFrQkVDLFFBQUEsR0FBV0QsV0FB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