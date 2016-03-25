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
  // source: node_modules/daisho-riot/lib/index.js
  require.define('daisho-riot/lib', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Controls;
    Controls = require('daisho-riot/lib/controls');
    module.exports = {
      RiotPage: require('daisho-riot/lib/page'),
      Events: require('daisho-riot/lib/events'),
      Controls: require('daisho-riot/lib/controls')
    }  //# sourceMappingURL=index.js.map
  });
  // source: node_modules/daisho-riot/lib/controls/index.js
  require.define('daisho-riot/lib/controls', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    module.exports = {
      Control: require('daisho-riot/lib/controls/control'),
      Text: require('daisho-riot/lib/controls/text'),
      register: function (m) {
        return this.Text.register(m)
      }
    }  //# sourceMappingURL=index.js.map
  });
  // source: node_modules/daisho-riot/lib/controls/control.js
  require.define('daisho-riot/lib/controls/control', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Control, CrowdControl, Events, riot, scrolling, extend = function (child, parent) {
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
    Events = require('daisho-riot/lib/events');
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
        var ref;
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
        return (ref = this.m) != null ? ref.trigger(Events.ChangeFailed, this.input.name, this.input.ref.get(this.input.name)) : void 0
      };
      Control.prototype.change = function () {
        var ref;
        Control.__super__.change.apply(this, arguments);
        return (ref = this.m) != null ? ref.trigger(Events.Change, this.input.name, this.input.ref.get(this.input.name)) : void 0
      };
      Control.prototype.changed = function (value) {
        var ref;
        if ((ref = this.m) != null) {
          ref.trigger(Events.ChangeSuccess, this.input.name, value)
        }
        return riot.update()
      };
      Control.register = function (m) {
        var v;
        v = Control.__super__.constructor.register.call(this);
        return v.m = m
      };
      return Control
    }(CrowdControl.Views.Input)  //# sourceMappingURL=control.js.map
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
  // source: node_modules/daisho-riot/lib/events.js
  require.define('daisho-riot/lib/events', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    module.exports = {
      Change: 'change',
      ChangeSuccess: 'change-success',
      ChangeFailed: 'change-failed'
    }  //# sourceMappingURL=events.js.map
  });
  // source: node_modules/daisho-riot/lib/controls/text.js
  require.define('daisho-riot/lib/controls/text', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Control, Text, extend = function (child, parent) {
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
    Control = require('daisho-riot/lib/controls/control');
    module.exports = Text = function (superClass) {
      extend(Text, superClass);
      function Text() {
        return Text.__super__.constructor.apply(this, arguments)
      }
      Text.prototype.tag = 'text-control';
      Text.prototype.type = 'text';
      Text.prototype.html = require('daisho-riot/templates/text');
      Text.prototype.formElement = 'input';
      Text.prototype.init = function () {
        Text.__super__.init.apply(this, arguments);
        console.log('text intiialized');
        return this.on('updated', function (_this) {
          return function () {
            var el;
            return el = _this.root.getElementsByTagName(_this.formElement)[0]
          }
        }(this))
      };
      return Text
    }(Control)  //# sourceMappingURL=text.js.map
  });
  // source: node_modules/daisho-riot/templates/text.html
  require.define('daisho-riot/templates/text', function (module, exports, __dirname, __filename, process) {
    module.exports = '<input id="{ input.name }" name="{ name || input.name }" type="{ type }" class="{ filled: input.ref(input.name) }" onchange="{ change }" onblur="{ change }" value="{ input.ref(input.name) }">\n<label for="{ input.name }">{ placeholder }</label>\n'
  });
  // source: node_modules/daisho-riot/lib/page.js
  require.define('daisho-riot/lib/page', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Page, RiotPage, riot, extend = function (child, parent) {
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
    Page = require('daisho-sdk/lib').Page;
    riot = require('riot/riot');
    module.exports = RiotPage = function (superClass) {
      extend(RiotPage, superClass);
      function RiotPage() {
        return RiotPage.__super__.constructor.apply(this, arguments)
      }
      RiotPage.prototype.tag = 'tag';
      RiotPage.prototype.opts = null;
      RiotPage.prototype.load = function (opts) {
        this.opts = opts != null ? opts : {}
      };
      RiotPage.prototype.render = function () {
        var el;
        el = document.createElement(this.tag);
        this.el.appendChild(el);
        return this.tag = riot.mount(this.tag, this.opts)[0]
      };
      RiotPage.prototype.unload = function () {
        return this.tag.unmount()
      };
      return RiotPage
    }(Page)  //# sourceMappingURL=page.js.map
  });
  // source: node_modules/daisho-sdk/lib/index.js
  require.define('daisho-sdk/lib', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    module.exports = {
      Page: require('daisho-sdk/lib/page'),
      Module: require('daisho-sdk/lib/module')
    }  //# sourceMappingURL=index.js.map
  });
  // source: node_modules/daisho-sdk/lib/page.js
  require.define('daisho-sdk/lib/page', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Page;
    module.exports = Page = function () {
      Page.prototype.el = null;
      Page.prototype.module = null;
      function Page(el, module1) {
        this.el = el;
        this.module = module1
      }
      Page.prototype.load = function (opts) {
        if (opts == null) {
          opts = {}
        }
      };
      Page.prototype.render = function () {
      };
      Page.prototype.unload = function () {
      };
      Page.prototype.annotations = function () {
      };
      return Page
    }()  //# sourceMappingURL=page.js.map
  });
  // source: node_modules/daisho-sdk/lib/module.js
  require.define('daisho-sdk/lib/module', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Module;
    module.exports = Module = function () {
      Module.prototype.json = null;
      function Module() {
      }
      Module.prototype.load = function () {
      };
      Module.prototype.unload = function () {
      };
      return Module
    }()  //# sourceMappingURL=module.js.map
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
    Daisho = require('./Users/zk/work/hanzo/daisho/src');
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
  // source: src/index.coffee
  require.define('./Users/zk/work/hanzo/daisho/src', function (module, exports, __dirname, __filename, process) {
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
  // source: node_modules/path-to-regexp/node_modules/isarray/index.js
  require.define('isarray', function (module, exports, __dirname, __filename, process) {
    module.exports = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]'
    }
  });
  // source: example/js/templates/dashboard.html
  require.define('./templates/dashboard', function (module, exports, __dirname, __filename, process) {
    module.exports = '<main>\n</main>\n<header>\n  <div class="branding">\n    <img class="logo" src="img/logo.png">\n    <span>hanzo</span>\n  </div>\n  <div class="orgname">\n    <span>Your Org</span>\n  </div>\n  <div class="username">\n    <span>Your Name</span>\n  </div>\n</header>\n<nav>\n  <ul>\n    <li each="{ m in moduleList }" onclick="{ route(m.key) }">\n      <div class="icon"></div>\n      <div class="name">\n        { m.name }\n      </div>\n    </li>\n  </ul>\n</nav>\n<search>SEARCH</search>\n\n<footer>FOOTER</footer>\n\n'
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
      Login: 'login',
      LoginSuccess: 'login-success',
      LoginFailed: 'login-failed'
    }
  });
  // source: example/js/templates/login.html
  require.define('./templates/login', function (module, exports, __dirname, __filename, process) {
    module.exports = '<form onsubmit={submit} if="{ !data.get(\'key\') }">\n  <text-control lookup="organization" placeholder="Organization"></text-control>\n  <text-control lookup="email" placeholder="Email"></text-control>\n  <text-control lookup="password" type="password" placeholder="Password"></text-control>\n  <button type="submit">Login</button>\n</form>\n\n'
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
              if (bp.userCustomerToken) {
                key = _this.getCustomerToken()
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
    var updateParam;
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
    updateParam = function (url, key, value) {
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
    exports.updateQuery = function (url, data) {
      var k, v;
      for (k in data) {
        v = data[k];
        url = updateParam(url, k, v)
      }
      return url
    }  //# sourceMappingURL=utils.js.map
  });
  // source: node_modules/hanzo.js/lib/client/xhr.js
  require.define('hanzo.js/lib/client/xhr', function (module, exports, __dirname, __filename, process) {
    // Generated by CoffeeScript 1.10.0
    var Xhr, XhrClient, cookie, isFunction, newError, ref, updateQuery;
    Xhr = require('xhr-promise-es6/lib');
    Xhr.Promise = require('broken/lib');
    cookie = require('js-cookie/src/js.cookie');
    ref = require('hanzo.js/lib/utils'), isFunction = ref.isFunction, newError = ref.newError, updateQuery = ref.updateQuery;
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
        return updateQuery(this.endpoint + url, { token: key })
      };
      XhrClient.prototype.request = function (blueprint, data, key) {
        var opts;
        if (key == null) {
          key = this.getKey()
        }
        opts = {
          url: this.getUrl(blueprint.url, data, key),
          method: blueprint.method
        };
        if (blueprint.method === 'GET') {
          opts.url = updateQuery(opts.url, opts.data)
        } else {
          opts.data = JSON.stringify(data)
        }
        if (this.debug) {
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
  // source: node_modules/js-cookie/src/js.cookie.js
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
    var Api, Controls, Events, Views, blueprints, client, d, data, k, m, refer, store, v;
    window.riot = require('riot/riot');
    Controls = require('daisho-riot/lib').Controls;
    refer = require('referential/lib');
    m = require('./mediator');
    Views = require('./views');
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
      Daisho.setRenderElement($('dashboard > main')[0]);
      return Daisho.route('home')
    })
  });
  require('app')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yaW90L3Jpb3QuanMiLCJub2RlX21vZHVsZXMvZGFpc2hvLXJpb3QvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhaXNoby1yaW90L2xpYi9jb250cm9scy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYWlzaG8tcmlvdC9saWIvY29udHJvbHMvY29udHJvbC5qcyIsIm5vZGVfbW9kdWxlcy9jcm93ZGNvbnRyb2wvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvcmlvdC5qcyIsIm5vZGVfbW9kdWxlcy9jcm93ZGNvbnRyb2wvbGliL3ZpZXdzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvdmlld3MvZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy9jcm93ZGNvbnRyb2wvbGliL3ZpZXdzL3ZpZXcuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWFzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1mdW5jdGlvbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jcm93ZGNvbnRyb2wvbGliL3ZpZXdzL2lucHV0aWZ5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvem91c2FuL3pvdXNhbi1taW4uanMiLCJub2RlX21vZHVsZXMvcmVmZXJlbnRpYWwvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZmVyZW50aWFsL2xpYi9yZWZlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWZlcmVudGlhbC9saWIvcmVmLmpzIiwibm9kZV9tb2R1bGVzL25vZGUuZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL25vZGUuZXh0ZW5kL2xpYi9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvaXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtbnVtYmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1zdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvbWlzZS1zZXR0bGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvbWlzZS1zZXR0bGUvbGliL3Byb21pc2Utc2V0dGxlLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3dkY29udHJvbC9saWIvdmlld3MvaW5wdXQuanMiLCJub2RlX21vZHVsZXMvZGFpc2hvLXJpb3QvbGliL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kYWlzaG8tcmlvdC9saWIvY29udHJvbHMvdGV4dC5qcyIsIm5vZGVfbW9kdWxlcy9kYWlzaG8tcmlvdC90ZW1wbGF0ZXMvdGV4dC5odG1sIiwibm9kZV9tb2R1bGVzL2RhaXNoby1yaW90L2xpYi9wYWdlLmpzIiwibm9kZV9tb2R1bGVzL2RhaXNoby1zZGsvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhaXNoby1zZGsvbGliL3BhZ2UuanMiLCJub2RlX21vZHVsZXMvZGFpc2hvLXNkay9saWIvbW9kdWxlLmpzIiwibWVkaWF0b3IuY29mZmVlIiwidmlld3MvaW5kZXguY29mZmVlIiwidmlld3MvZGFzaGJvYXJkLmNvZmZlZSIsIlVzZXJzL3prL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMveGhyLXByb21pc2UtZXM2L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL3BhcnNlLWhlYWRlcnMuanMiLCJub2RlX21vZHVsZXMvdHJpbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mb3ItZWFjaC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYWdlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhdGgtdG8tcmVnZXhwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhdGgtdG8tcmVnZXhwL25vZGVfbW9kdWxlcy9pc2FycmF5L2luZGV4LmpzIiwidGVtcGxhdGVzL2Rhc2hib2FyZC5odG1sIiwidmlld3MvbG9naW4uY29mZmVlIiwidmlld3MvbWlkZGxld2FyZS5jb2ZmZWUiLCJub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwiZXZlbnRzLmNvZmZlZSIsInRlbXBsYXRlcy9sb2dpbi5odG1sIiwidXRpbHMvc3RvcmUuY29mZmVlIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JlLmpzIiwibm9kZV9tb2R1bGVzL2Nvb2tpZXMtanMvZGlzdC9jb29raWVzLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL2xpYi9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL2xpYi9hcGkuanMiLCJub2RlX21vZHVsZXMvaGFuem8uanMvbGliL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL2xpYi9jbGllbnQveGhyLmpzIiwibm9kZV9tb2R1bGVzL2pzLWNvb2tpZS9zcmMvanMuY29va2llLmpzIiwibm9kZV9tb2R1bGVzL2hhbnpvLmpzL2xpYi9ibHVlcHJpbnRzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvaGFuem8uanMvbGliL2JsdWVwcmludHMvdXJsLmpzIiwiYmx1ZXByaW50cy5jb2ZmZWUiLCJhcHAuY29mZmVlIl0sIm5hbWVzIjpbIndpbmRvdyIsInVuZGVmaW5lZCIsInJpb3QiLCJ2ZXJzaW9uIiwic2V0dGluZ3MiLCJfX3VpZCIsIl9fdmlydHVhbERvbSIsIl9fdGFnSW1wbCIsIkdMT0JBTF9NSVhJTiIsIlJJT1RfUFJFRklYIiwiUklPVF9UQUciLCJSSU9UX1RBR19JUyIsIlRfU1RSSU5HIiwiVF9PQkpFQ1QiLCJUX1VOREVGIiwiVF9CT09MIiwiVF9GVU5DVElPTiIsIlNQRUNJQUxfVEFHU19SRUdFWCIsIlJFU0VSVkVEX1dPUkRTX0JMQUNLTElTVCIsIklFX1ZFUlNJT04iLCJkb2N1bWVudCIsImRvY3VtZW50TW9kZSIsIm9ic2VydmFibGUiLCJlbCIsImNhbGxiYWNrcyIsInNsaWNlIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJvbkVhY2hFdmVudCIsImUiLCJmbiIsInJlcGxhY2UiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0aWVzIiwib24iLCJ2YWx1ZSIsImV2ZW50cyIsIm5hbWUiLCJwb3MiLCJwdXNoIiwidHlwZWQiLCJlbnVtZXJhYmxlIiwid3JpdGFibGUiLCJjb25maWd1cmFibGUiLCJvZmYiLCJhcnIiLCJpIiwiY2IiLCJzcGxpY2UiLCJvbmUiLCJhcHBseSIsImFyZ3VtZW50cyIsInRyaWdnZXIiLCJhcmdsZW4iLCJsZW5ndGgiLCJhcmdzIiwiZm5zIiwiY2FsbCIsImJ1c3kiLCJjb25jYXQiLCJSRV9PUklHSU4iLCJFVkVOVF9MSVNURU5FUiIsIlJFTU9WRV9FVkVOVF9MSVNURU5FUiIsIkFERF9FVkVOVF9MSVNURU5FUiIsIkhBU19BVFRSSUJVVEUiLCJSRVBMQUNFIiwiUE9QU1RBVEUiLCJIQVNIQ0hBTkdFIiwiVFJJR0dFUiIsIk1BWF9FTUlUX1NUQUNLX0xFVkVMIiwid2luIiwiZG9jIiwiaGlzdCIsImhpc3RvcnkiLCJsb2MiLCJsb2NhdGlvbiIsInByb3QiLCJSb3V0ZXIiLCJjbGlja0V2ZW50Iiwib250b3VjaHN0YXJ0Iiwic3RhcnRlZCIsImNlbnRyYWwiLCJyb3V0ZUZvdW5kIiwiZGVib3VuY2VkRW1pdCIsImJhc2UiLCJjdXJyZW50IiwicGFyc2VyIiwic2Vjb25kUGFyc2VyIiwiZW1pdFN0YWNrIiwiZW1pdFN0YWNrTGV2ZWwiLCJERUZBVUxUX1BBUlNFUiIsInBhdGgiLCJzcGxpdCIsIkRFRkFVTFRfU0VDT05EX1BBUlNFUiIsImZpbHRlciIsInJlIiwiUmVnRXhwIiwibWF0Y2giLCJkZWJvdW5jZSIsImRlbGF5IiwidCIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJzdGFydCIsImF1dG9FeGVjIiwiZW1pdCIsImNsaWNrIiwiJCIsInMiLCJiaW5kIiwibm9ybWFsaXplIiwiaXNTdHJpbmciLCJzdHIiLCJnZXRQYXRoRnJvbVJvb3QiLCJocmVmIiwiZ2V0UGF0aEZyb21CYXNlIiwiZm9yY2UiLCJpc1Jvb3QiLCJzaGlmdCIsIndoaWNoIiwibWV0YUtleSIsImN0cmxLZXkiLCJzaGlmdEtleSIsImRlZmF1bHRQcmV2ZW50ZWQiLCJ0YXJnZXQiLCJub2RlTmFtZSIsInBhcmVudE5vZGUiLCJpbmRleE9mIiwiZ28iLCJ0aXRsZSIsInByZXZlbnREZWZhdWx0Iiwic2hvdWxkUmVwbGFjZSIsInJlcGxhY2VTdGF0ZSIsInB1c2hTdGF0ZSIsIm0iLCJmaXJzdCIsInNlY29uZCIsInRoaXJkIiwiciIsInNvbWUiLCJhY3Rpb24iLCJtYWluUm91dGVyIiwicm91dGUiLCJjcmVhdGUiLCJuZXdTdWJSb3V0ZXIiLCJzdG9wIiwiYXJnIiwiZXhlYyIsImZuMiIsInF1ZXJ5IiwicSIsIl8iLCJrIiwidiIsInJlYWR5U3RhdGUiLCJicmFja2V0cyIsIlVOREVGIiwiUkVHTE9CIiwiUl9NTENPTU1TIiwiUl9TVFJJTkdTIiwiU19RQkxPQ0tTIiwic291cmNlIiwiRklOREJSQUNFUyIsIkRFRkFVTFQiLCJfcGFpcnMiLCJjYWNoZWRCcmFja2V0cyIsIl9yZWdleCIsIl9jYWNoZSIsIl9zZXR0aW5ncyIsIl9sb29wYmFjayIsIl9yZXdyaXRlIiwiYnAiLCJnbG9iYWwiLCJfY3JlYXRlIiwicGFpciIsInRlc3QiLCJFcnJvciIsIl9icmFja2V0cyIsInJlT3JJZHgiLCJ0bXBsIiwiX2JwIiwicGFydHMiLCJpc2V4cHIiLCJsYXN0SW5kZXgiLCJpbmRleCIsInNraXBCcmFjZXMiLCJ1bmVzY2FwZVN0ciIsImNoIiwiaXgiLCJyZWNjaCIsImhhc0V4cHIiLCJsb29wS2V5cyIsImV4cHIiLCJrZXkiLCJ2YWwiLCJ0cmltIiwiaGFzUmF3Iiwic3JjIiwiYXJyYXkiLCJfcmVzZXQiLCJfc2V0U2V0dGluZ3MiLCJvIiwiYiIsImRlZmluZVByb3BlcnR5Iiwic2V0IiwiZ2V0IiwiX3RtcGwiLCJkYXRhIiwiX2xvZ0VyciIsImhhdmVSYXciLCJlcnJvckhhbmRsZXIiLCJlcnIiLCJjdHgiLCJyaW90RGF0YSIsInRhZ05hbWUiLCJyb290IiwiX3Jpb3RfaWQiLCJfZ2V0VG1wbCIsIkZ1bmN0aW9uIiwiUkVfUUJMT0NLIiwiUkVfUUJNQVJLIiwicXN0ciIsImoiLCJsaXN0IiwiX3BhcnNlRXhwciIsImpvaW4iLCJSRV9CUkVORCIsIkNTX0lERU5UIiwiYXNUZXh0IiwiZGl2IiwiY250IiwianNiIiwicmlnaHRDb250ZXh0IiwiX3dyYXBFeHByIiwibW0iLCJsdiIsImlyIiwiSlNfQ09OVEVYVCIsIkpTX1ZBUk5BTUUiLCJKU19OT1BST1BTIiwidGIiLCJwIiwibXZhciIsInBhcnNlIiwibWtkb20iLCJfbWtkb20iLCJyZUhhc1lpZWxkIiwicmVZaWVsZEFsbCIsInJlWWllbGRTcmMiLCJyZVlpZWxkRGVzdCIsInJvb3RFbHMiLCJ0ciIsInRoIiwidGQiLCJjb2wiLCJ0YmxUYWdzIiwidGVtcGwiLCJodG1sIiwidG9Mb3dlckNhc2UiLCJta0VsIiwicmVwbGFjZVlpZWxkIiwic3BlY2lhbFRhZ3MiLCJpbm5lckhUTUwiLCJzdHViIiwic2VsZWN0IiwicGFyZW50IiwiZmlyc3RDaGlsZCIsInNlbGVjdGVkSW5kZXgiLCJ0bmFtZSIsImNoaWxkRWxlbWVudENvdW50IiwicmVmIiwidGV4dCIsImRlZiIsIm1raXRlbSIsIml0ZW0iLCJ1bm1vdW50UmVkdW5kYW50IiwiaXRlbXMiLCJ0YWdzIiwidW5tb3VudCIsIm1vdmVOZXN0ZWRUYWdzIiwiY2hpbGQiLCJrZXlzIiwiZm9yRWFjaCIsInRhZyIsImlzQXJyYXkiLCJlYWNoIiwibW92ZUNoaWxkVGFnIiwiYWRkVmlydHVhbCIsIl9yb290Iiwic2liIiwiX3ZpcnRzIiwibmV4dFNpYmxpbmciLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsIm1vdmVWaXJ0dWFsIiwibGVuIiwiX2VhY2giLCJkb20iLCJyZW1BdHRyIiwibXVzdFJlb3JkZXIiLCJnZXRBdHRyIiwiZ2V0VGFnTmFtZSIsImltcGwiLCJvdXRlckhUTUwiLCJ1c2VSb290IiwiY3JlYXRlVGV4dE5vZGUiLCJnZXRUYWciLCJpc09wdGlvbiIsIm9sZEl0ZW1zIiwiaGFzS2V5cyIsImlzVmlydHVhbCIsInJlbW92ZUNoaWxkIiwiZnJhZyIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJtYXAiLCJpdGVtc0xlbmd0aCIsIl9tdXN0UmVvcmRlciIsIm9sZFBvcyIsIlRhZyIsImlzTG9vcCIsImhhc0ltcGwiLCJjbG9uZU5vZGUiLCJtb3VudCIsInVwZGF0ZSIsImNoaWxkTm9kZXMiLCJfaXRlbSIsInNpIiwib3AiLCJvcHRpb25zIiwic2VsZWN0ZWQiLCJfX3NlbGVjdGVkIiwic3R5bGVNYW5hZ2VyIiwiX3Jpb3QiLCJhZGQiLCJpbmplY3QiLCJzdHlsZU5vZGUiLCJuZXdOb2RlIiwic2V0QXR0ciIsInVzZXJOb2RlIiwiaWQiLCJyZXBsYWNlQ2hpbGQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImNzc1RleHRQcm9wIiwic3R5bGVTaGVldCIsInN0eWxlc1RvSW5qZWN0IiwiY3NzIiwiY3NzVGV4dCIsInBhcnNlTmFtZWRFbGVtZW50cyIsImNoaWxkVGFncyIsImZvcmNlUGFyc2luZ05hbWVkIiwid2FsayIsIm5vZGVUeXBlIiwiaW5pdENoaWxkVGFnIiwic2V0TmFtZWQiLCJwYXJzZUV4cHJlc3Npb25zIiwiZXhwcmVzc2lvbnMiLCJhZGRFeHByIiwiZXh0cmEiLCJleHRlbmQiLCJ0eXBlIiwiYXR0ciIsIm5vZGVWYWx1ZSIsImF0dHJpYnV0ZXMiLCJib29sIiwiY29uZiIsInNlbGYiLCJvcHRzIiwiaW5oZXJpdCIsImNsZWFuVXBEYXRhIiwiaW1wbEF0dHIiLCJwcm9wc0luU3luY1dpdGhQYXJlbnQiLCJfdGFnIiwiaXNNb3VudGVkIiwidXBkYXRlT3B0cyIsInRvQ2FtZWwiLCJub3JtYWxpemVEYXRhIiwiaXNXcml0YWJsZSIsImluaGVyaXRGcm9tUGFyZW50IiwibXVzdFN5bmMiLCJjb250YWlucyIsImlzSW5oZXJpdGVkIiwiaXNPYmplY3QiLCJyQUYiLCJtaXgiLCJpbnN0YW5jZSIsIm1peGluIiwiaXNGdW5jdGlvbiIsImdldE93blByb3BlcnR5TmFtZXMiLCJpbml0IiwiZ2xvYmFsTWl4aW4iLCJ0b2dnbGUiLCJhdHRycyIsIndhbGtBdHRyaWJ1dGVzIiwiaXNJblN0dWIiLCJrZWVwUm9vdFRhZyIsInB0YWciLCJ0YWdJbmRleCIsImdldEltbWVkaWF0ZUN1c3RvbVBhcmVudFRhZyIsIm9uQ2hpbGRVcGRhdGUiLCJpc01vdW50IiwiZXZ0Iiwic2V0RXZlbnRIYW5kbGVyIiwiaGFuZGxlciIsIl9wYXJlbnQiLCJldmVudCIsImN1cnJlbnRUYXJnZXQiLCJzcmNFbGVtZW50IiwiY2hhckNvZGUiLCJrZXlDb2RlIiwicmV0dXJuVmFsdWUiLCJwcmV2ZW50VXBkYXRlIiwiaW5zZXJ0VG8iLCJub2RlIiwiYmVmb3JlIiwiYXR0ck5hbWUiLCJyZW1vdmUiLCJpblN0dWIiLCJzdHlsZSIsImRpc3BsYXkiLCJzdGFydHNXaXRoIiwiZWxzIiwicmVtb3ZlQXR0cmlidXRlIiwic3RyaW5nIiwiYyIsInRvVXBwZXJDYXNlIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiYWRkQ2hpbGRUYWciLCJjYWNoZWRUYWciLCJuZXdQb3MiLCJuYW1lZFRhZyIsIm9iaiIsImEiLCJwcm9wcyIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImNyZWF0ZUVsZW1lbnQiLCIkJCIsInNlbGVjdG9yIiwicXVlcnlTZWxlY3RvckFsbCIsInF1ZXJ5U2VsZWN0b3IiLCJDaGlsZCIsImdldE5hbWVkS2V5IiwiaXNBcnIiLCJ3IiwicmFmIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwid2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwibGFzdFRpbWUiLCJub3d0aW1lIiwiRGF0ZSIsIm5vdyIsInRpbWVvdXQiLCJNYXRoIiwibWF4IiwibW91bnRUbyIsIl9pbm5lckhUTUwiLCJ1dGlsIiwibWl4aW5zIiwidGFnMiIsImFsbFRhZ3MiLCJhZGRSaW90VGFncyIsInNlbGVjdEFsbFRhZ3MiLCJwdXNoVGFncyIsInJpb3RUYWciLCJub2RlTGlzdCIsIl9lbCIsImV4cG9ydHMiLCJtb2R1bGUiLCJkZWZpbmUiLCJhbWQiLCJDb250cm9scyIsInJlcXVpcmUiLCJSaW90UGFnZSIsIkV2ZW50cyIsIkNvbnRyb2wiLCJUZXh0IiwicmVnaXN0ZXIiLCJDcm93ZENvbnRyb2wiLCJzY3JvbGxpbmciLCJoYXNQcm9wIiwiY3RvciIsImNvbnN0cnVjdG9yIiwiX19zdXBlcl9fIiwiaGFzT3duUHJvcGVydHkiLCJzdXBlckNsYXNzIiwiaW5wdXQiLCJpbnB1dHMiLCJsb29rdXAiLCJnZXRWYWx1ZSIsImVycm9yIiwiRE9NRXhjZXB0aW9uIiwiY29uc29sZSIsImxvZyIsImFuaW1hdGUiLCJzY3JvbGxUb3AiLCJvZmZzZXQiLCJ0b3AiLCJoZWlnaHQiLCJjb21wbGV0ZSIsImR1cmF0aW9uIiwiQ2hhbmdlRmFpbGVkIiwiY2hhbmdlIiwiQ2hhbmdlIiwiY2hhbmdlZCIsIkNoYW5nZVN1Y2Nlc3MiLCJWaWV3cyIsIklucHV0IiwicmVzdWx0cyIsIkNyb3dkc3RhcnQiLCJDcm93ZGNvbnRyb2wiLCJGb3JtIiwiVmlldyIsIlByb21pc2UiLCJpbnB1dGlmeSIsInNldHRsZSIsImNvbmZpZ3MiLCJpbml0SW5wdXRzIiwicmVzdWx0czEiLCJzdWJtaXQiLCJwUmVmIiwicHMiLCJ0aGVuIiwiX3RoaXMiLCJyZXN1bHQiLCJpc0Z1bGZpbGxlZCIsIl9zdWJtaXQiLCJjb2xsYXBzZVByb3RvdHlwZSIsIm9iamVjdEFzc2lnbiIsInNldFByb3RvdHlwZU9mIiwibWl4aW5Qcm9wZXJ0aWVzIiwic2V0UHJvdG9PZiIsInByb3RvIiwiX19wcm90b19fIiwicHJvcCIsImNvbGxhcHNlIiwicGFyZW50UHJvdG8iLCJnZXRQcm90b3R5cGVPZiIsIm5ld1Byb3RvIiwiYmVmb3JlSW5pdCIsIm9sZEZuIiwicHJvcElzRW51bWVyYWJsZSIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwidG9PYmplY3QiLCJUeXBlRXJyb3IiLCJhc3NpZ24iLCJmcm9tIiwidG8iLCJzeW1ib2xzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwidG9TdHJpbmciLCJhbGVydCIsImNvbmZpcm0iLCJwcm9tcHQiLCJpc1JlZiIsInJlZmVyIiwiY29uZmlnIiwiZm4xIiwibWlkZGxld2FyZSIsIm1pZGRsZXdhcmVGbiIsInZhbGlkYXRlIiwicmVzb2x2ZSIsImxlbjEiLCJQcm9taXNlSW5zcGVjdGlvbiIsInN1cHByZXNzVW5jYXVnaHRSZWplY3Rpb25FcnJvciIsInN0YXRlIiwicmVhc29uIiwiaXNSZWplY3RlZCIsInJlZmxlY3QiLCJwcm9taXNlIiwicmVqZWN0IiwicHJvbWlzZXMiLCJhbGwiLCJjYWxsYmFjayIsIm4iLCJ5IiwidSIsImYiLCJNdXRhdGlvbk9ic2VydmVyIiwib2JzZXJ2ZSIsInNldEltbWVkaWF0ZSIsInN0YWNrIiwibCIsIlpvdXNhbiIsInNvb24iLCJSZWYiLCJtZXRob2QiLCJyZWYxIiwid3JhcHBlciIsImNsb25lIiwiaXNOdW1iZXIiLCJfdmFsdWUiLCJrZXkxIiwiX211dGF0ZSIsInByZXYiLCJuZXh0IiwiU3RyaW5nIiwiaXMiLCJkZWVwIiwiY29weSIsImNvcHlfaXNfYXJyYXkiLCJoYXNoIiwib2JqUHJvdG8iLCJvd25zIiwidG9TdHIiLCJzeW1ib2xWYWx1ZU9mIiwiU3ltYm9sIiwidmFsdWVPZiIsImlzQWN0dWFsTmFOIiwiTk9OX0hPU1RfVFlQRVMiLCJudW1iZXIiLCJiYXNlNjRSZWdleCIsImhleFJlZ2V4IiwiZGVmaW5lZCIsImVtcHR5IiwiZXF1YWwiLCJvdGhlciIsImdldFRpbWUiLCJob3N0ZWQiLCJob3N0IiwibmlsIiwidW5kZWYiLCJpc1N0YW5kYXJkQXJndW1lbnRzIiwiaXNPbGRBcmd1bWVudHMiLCJhcnJheWxpa2UiLCJvYmplY3QiLCJjYWxsZWUiLCJpc0Zpbml0ZSIsIkJvb2xlYW4iLCJOdW1iZXIiLCJkYXRlIiwiZWxlbWVudCIsIkhUTUxFbGVtZW50IiwiaXNBbGVydCIsImluZmluaXRlIiwiSW5maW5pdHkiLCJkZWNpbWFsIiwiZGl2aXNpYmxlQnkiLCJpc0RpdmlkZW5kSW5maW5pdGUiLCJpc0Rpdmlzb3JJbmZpbml0ZSIsImlzTm9uWmVyb051bWJlciIsImludGVnZXIiLCJtYXhpbXVtIiwib3RoZXJzIiwibWluaW11bSIsIm5hbiIsImV2ZW4iLCJvZGQiLCJnZSIsImd0IiwibGUiLCJsdCIsIndpdGhpbiIsImZpbmlzaCIsImlzQW55SW5maW5pdGUiLCJzZXRJbnRlcnZhbCIsInJlZ2V4cCIsImJhc2U2NCIsImhleCIsInN5bWJvbCIsInR5cGVPZiIsIm51bSIsImlzQnVmZmVyIiwia2luZE9mIiwiQnVmZmVyIiwiX2lzQnVmZmVyIiwieCIsInN0clZhbHVlIiwidHJ5U3RyaW5nT2JqZWN0Iiwic3RyQ2xhc3MiLCJoYXNUb1N0cmluZ1RhZyIsInRvU3RyaW5nVGFnIiwicHJvbWlzZVJlc3VsdHMiLCJwcm9taXNlUmVzdWx0IiwiY2F0Y2giLCJyZXR1cm5zIiwidGhyb3dzIiwiZXJyb3JNZXNzYWdlIiwiZXJyb3JIdG1sIiwiY2xlYXJFcnJvciIsIm1lc3NhZ2UiLCJmb3JtRWxlbWVudCIsIlBhZ2UiLCJsb2FkIiwicmVuZGVyIiwidW5sb2FkIiwiTW9kdWxlIiwibW9kdWxlMSIsImFubm90YXRpb25zIiwianNvbiIsIkRhc2hib2FyZCIsIkxvZ2luIiwiRGFpc2hvIiwiWGhyIiwicGFnZSIsInVybEZvciIsImZpbGUiLCJiYXNlUGF0aCIsIm1vZHVsZURlZmluaXRpb25zIiwibW9kdWxlc1JlcXVpcmVkIiwibW9kdWxlcyIsIm1vZHVsZUxpc3QiLCJyZW5kZXJFbGVtZW50IiwibW9kdWxlc1VybCIsInVybCIsInNlbmQiLCJyZXMiLCJyZXNwb25zZVRleHQiLCJzZXRSZW5kZXJFbGVtZW50IiwiZGVmYXVsdE1vZHVsZSIsIm1vZHVsZVJlcXVpcmVkIiwidGltZW91dElkIiwid2FpdHMiLCJkZWZpbml0aW9uIiwianMiLCJyb3V0ZXMiLCJtb2R1bGVJbnN0YW5jZSIsInJlZjIiLCJyZWYzIiwiYWN0aXZlTW9kdWxlSW5zdGFuY2UiLCJhY3RpdmVQYWdlSW5zdGFuY2UiLCJfZ2V0TW9kdWxlIiwibW9kdWxlTmFtZSIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiYXN5bmMiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiaGVhZGVyIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJfaGFuZGxlRXJyb3IiLCJfeGhyIiwib25sb2FkIiwiX2RldGFjaFdpbmRvd1VubG9hZCIsIl9nZXRSZXNwb25zZVRleHQiLCJfZXJyb3IiLCJfZ2V0UmVzcG9uc2VVcmwiLCJzdGF0dXMiLCJzdGF0dXNUZXh0IiwiX2dldEhlYWRlcnMiLCJvbmVycm9yIiwib250aW1lb3V0Iiwib25hYm9ydCIsIl9hdHRhY2hXaW5kb3dVbmxvYWQiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsImdldFhIUiIsIl91bmxvYWRIYW5kbGVyIiwiX2hhbmRsZVdpbmRvd1VubG9hZCIsImF0dGFjaEV2ZW50IiwiZGV0YWNoRXZlbnQiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJnZXRSZXNwb25zZUhlYWRlciIsIkpTT04iLCJyZXNwb25zZVVSTCIsImFib3J0Iiwicm93IiwibGVmdCIsInJpZ2h0IiwiaXRlcmF0b3IiLCJjb250ZXh0IiwiZm9yRWFjaEFycmF5IiwiZm9yRWFjaFN0cmluZyIsImZvckVhY2hPYmplY3QiLCJjaGFyQXQiLCJwYXRodG9SZWdleHAiLCJkaXNwYXRjaCIsImRlY29kZVVSTENvbXBvbmVudHMiLCJydW5uaW5nIiwiaGFzaGJhbmciLCJwcmV2Q29udGV4dCIsIlJvdXRlIiwiZXhpdHMiLCJwb3BzdGF0ZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbnBvcHN0YXRlIiwib25jbGljayIsInN1YnN0ciIsInNlYXJjaCIsInBhdGhuYW1lIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInNob3ciLCJDb250ZXh0IiwiaGFuZGxlZCIsImJhY2siLCJyZWRpcmVjdCIsInNhdmUiLCJuZXh0RXhpdCIsIm5leHRFbnRlciIsInVuaGFuZGxlZCIsImNhbm9uaWNhbFBhdGgiLCJleGl0IiwiZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudCIsImRlY29kZVVSSUNvbXBvbmVudCIsInF1ZXJ5c3RyaW5nIiwicGFyYW1zIiwicXNJbmRleCIsImxvYWRlZCIsImhhc0F0dHJpYnV0ZSIsImxpbmsiLCJzYW1lT3JpZ2luIiwicHJvY2VzcyIsIm9yaWciLCJidXR0b24iLCJvcmlnaW4iLCJwcm90b2NvbCIsImhvc3RuYW1lIiwicG9ydCIsImlzYXJyYXkiLCJwYXRoVG9SZWdleHAiLCJjb21waWxlIiwidG9rZW5zVG9GdW5jdGlvbiIsInRva2Vuc1RvUmVnRXhwIiwiUEFUSF9SRUdFWFAiLCJ0b2tlbnMiLCJlc2NhcGVkIiwicHJlZml4IiwiY2FwdHVyZSIsImdyb3VwIiwic3VmZml4IiwiYXN0ZXJpc2siLCJyZXBlYXQiLCJvcHRpb25hbCIsImRlbGltaXRlciIsInBhdHRlcm4iLCJlc2NhcGVHcm91cCIsIm1hdGNoZXMiLCJ0b2tlbiIsInNlZ21lbnQiLCJlbmNvZGVVUklDb21wb25lbnQiLCJlc2NhcGVTdHJpbmciLCJhdHRhY2hLZXlzIiwiZmxhZ3MiLCJzZW5zaXRpdmUiLCJyZWdleHBUb1JlZ2V4cCIsImdyb3VwcyIsImFycmF5VG9SZWdleHAiLCJzdHJpbmdUb1JlZ2V4cCIsInN0cmljdCIsImVuZCIsImxhc3RUb2tlbiIsImVuZHNXaXRoU2xhc2giLCJMb2dpbkZvcm0iLCJpc0VtYWlsIiwiaXNQYXNzd29yZCIsImlzUmVxdWlyZWQiLCJjbGllbnRfaWQiLCJncmFudF90eXBlIiwiY2xpZW50Iiwib2F1dGgiLCJhdXRoIiwiTG9naW5TdWNjZXNzIiwiTG9naW5GYWlsZWQiLCJlbWFpbFJlIiwibWF0Y2hlc1Bhc3N3b3JkIiwic3BsaXROYW1lIiwidmVuZG9ycyIsImNhZiIsImxhc3QiLCJxdWV1ZSIsImZyYW1lRHVyYXRpb24iLCJfbm93IiwiY3AiLCJjYW5jZWxsZWQiLCJyb3VuZCIsImhhbmRsZSIsImNhbmNlbCIsInBvbHlmaWxsIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJnZXROYW5vU2Vjb25kcyIsImhydGltZSIsImxvYWRUaW1lIiwicGVyZm9ybWFuY2UiLCJociIsImNvb2tpZXMiLCJzdG9yZSIsImVuYWJsZWQiLCJzdHJpbmdpZnkiLCJjbGVhciIsImtzIiwiZXhwaXJlIiwiZmFjdG9yeSIsImxvY2FsU3RvcmFnZU5hbWUiLCJzY3JpcHRUYWciLCJzdG9yYWdlIiwiZGlzYWJsZWQiLCJkZWZhdWx0VmFsIiwiaGFzIiwidHJhbnNhY3QiLCJ0cmFuc2FjdGlvbkZuIiwiZ2V0QWxsIiwic2VyaWFsaXplIiwiZGVzZXJpYWxpemUiLCJpc0xvY2FsU3RvcmFnZU5hbWVTdXBwb3J0ZWQiLCJzZXRJdGVtIiwiZ2V0SXRlbSIsInJlbW92ZUl0ZW0iLCJyZXQiLCJkb2N1bWVudEVsZW1lbnQiLCJhZGRCZWhhdmlvciIsInN0b3JhZ2VPd25lciIsInN0b3JhZ2VDb250YWluZXIiLCJBY3RpdmVYT2JqZWN0Iiwid3JpdGUiLCJjbG9zZSIsImZyYW1lcyIsImJvZHkiLCJ3aXRoSUVTdG9yYWdlIiwic3RvcmVGdW5jdGlvbiIsInVuc2hpZnQiLCJmb3JiaWRkZW5DaGFyc1JlZ2V4IiwiaWVLZXlGaXgiLCJYTUxEb2N1bWVudCIsInRlc3RLZXkiLCJDb29raWVzIiwiX2RvY3VtZW50IiwiX2NhY2hlS2V5UHJlZml4IiwiX21heEV4cGlyZURhdGUiLCJzZWN1cmUiLCJfY2FjaGVkRG9jdW1lbnRDb29raWUiLCJjb29raWUiLCJfcmVuZXdDYWNoZSIsIl9nZXRFeHRlbmRlZE9wdGlvbnMiLCJleHBpcmVzIiwiX2dldEV4cGlyZXNEYXRlIiwiX2dlbmVyYXRlQ29va2llU3RyaW5nIiwiZG9tYWluIiwiX2lzVmFsaWREYXRlIiwiaXNOYU4iLCJjb29raWVTdHJpbmciLCJ0b1VUQ1N0cmluZyIsIl9nZXRDYWNoZUZyb21TdHJpbmciLCJkb2N1bWVudENvb2tpZSIsImNvb2tpZUNhY2hlIiwiY29va2llc0FycmF5IiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImRlY29kZWRLZXkiLCJfYXJlRW5hYmxlZCIsImFyZUVuYWJsZWQiLCJjb29raWVzRXhwb3J0IiwiQXBpIiwiQ2xpZW50IiwiSGFuem8iLCJDTElFTlQiLCJCTFVFUFJJTlRTIiwibmV3RXJyb3IiLCJzdGF0dXNPayIsImJsdWVwcmludHMiLCJkZWJ1ZyIsImVuZHBvaW50IiwiYWRkQmx1ZXByaW50cyIsImFwaSIsImV4cGVjdHMiLCJ1c2VyQ3VzdG9tZXJUb2tlbiIsImdldEN1c3RvbWVyVG9rZW4iLCJyZXF1ZXN0Iiwic2V0S2V5Iiwic2V0Q3VzdG9tZXJUb2tlbiIsImRlbGV0ZUN1c3RvbWVyVG9rZW4iLCJzZXRTdG9yZSIsInN0b3JlSWQiLCJ1cGRhdGVQYXJhbSIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJyZWY0IiwicmVxIiwic2VwYXJhdG9yIiwidXBkYXRlUXVlcnkiLCJYaHJDbGllbnQiLCJzZXNzaW9uTmFtZSIsInNldEVuZHBvaW50IiwiZ2V0S2V5IiwiS0VZIiwic2Vzc2lvbiIsImdldEpTT04iLCJjdXN0b21lclRva2VuIiwiZ2V0VXJsIiwiYmx1ZXByaW50IiwiX09sZENvb2tpZXMiLCJub0NvbmZsaWN0IiwiY29udmVydGVyIiwic2V0TWlsbGlzZWNvbmRzIiwiZ2V0TWlsbGlzZWNvbmRzIiwiZXNjYXBlIiwicmRlY29kZSIsInJlYWQiLCJ3aXRoQ29udmVydGVyIiwiYnlJZCIsImNyZWF0ZUJsdWVwcmludCIsIm1vZGVsIiwibW9kZWxzIiwic3RvcmVQcmVmaXhlZCIsInVzZXJNb2RlbHMiLCJhY2NvdW50IiwidXNlQ3VzdG9tZXJUb2tlbiIsImV4aXN0cyIsImVtYWlsIiwiZW5hYmxlIiwidG9rZW5JZCIsImxvZ2luIiwibG9nb3V0IiwicmVzZXQiLCJjaGVja291dCIsImF1dGhvcml6ZSIsIm9yZGVySWQiLCJjaGFyZ2UiLCJwYXlwYWwiLCJyZWZlcnJlciIsInNwIiwiY29kZSIsInNsdWciLCJza3UiLCJkIiwiYWNjZXNzX3Rva2VuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFQTtBQUFBLEs7SUFBQyxDQUFDLFVBQVNBLE1BQVQsRUFBaUJDLFNBQWpCLEVBQTRCO0FBQUEsTUFDNUIsYUFENEI7QUFBQSxNQUU5QixJQUFJQyxJQUFBLEdBQU87QUFBQSxVQUFFQyxPQUFBLEVBQVMsU0FBWDtBQUFBLFVBQXNCQyxRQUFBLEVBQVUsRUFBaEM7QUFBQSxTQUFYO0FBQUEsUUFLRTtBQUFBO0FBQUE7QUFBQSxRQUFBQyxLQUFBLEdBQVEsQ0FMVjtBQUFBLFFBT0U7QUFBQSxRQUFBQyxZQUFBLEdBQWUsRUFQakI7QUFBQSxRQVNFO0FBQUEsUUFBQUMsU0FBQSxHQUFZLEVBVGQ7QUFBQSxRQWNFO0FBQUE7QUFBQTtBQUFBLFFBQUFDLFlBQUEsR0FBZSxnQkFkakI7QUFBQSxRQWlCRTtBQUFBLFFBQUFDLFdBQUEsR0FBYyxPQWpCaEIsRUFrQkVDLFFBQUEsR0FBV0QsV0FBQSxHQUFjLEtBbEIzQixFQW1CRUUsV0FBQSxHQUFjLFNBbkJoQjtBQUFBLFFBc0JFO0FBQUEsUUFBQUMsUUFBQSxHQUFXLFFBdEJiLEVBdUJFQyxRQUFBLEdBQVcsUUF2QmIsRUF3QkVDLE9BQUEsR0FBVyxXQXhCYixFQXlCRUMsTUFBQSxHQUFXLFNBekJiLEVBMEJFQyxVQUFBLEdBQWEsVUExQmY7QUFBQSxRQTRCRTtBQUFBLFFBQUFDLGtCQUFBLEdBQXFCLHdFQTVCdkIsRUE2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