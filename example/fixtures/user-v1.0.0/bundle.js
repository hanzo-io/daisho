// source: src/sdk/index.coffee
require.define('./Users/dtai/work/hanzo/daisho/src/sdk', function (module, exports, __dirname, __filename, process) {
  module.exports = {
    Page: require('./Users/dtai/work/hanzo/daisho/src/sdk/page'),
    Module: require('./Users/dtai/work/hanzo/daisho/src/sdk/module')
  }
});
// source: src/sdk/page.coffee
require.define('./Users/dtai/work/hanzo/daisho/src/sdk/page', function (module, exports, __dirname, __filename, process) {
  var Page;
  module.exports = Page = function () {
    Page.prototype.el = null;
    Page.prototype.module = null;
    function Page(el, module1) {
      this.el = el;
      this.module = module1
    }
    Page.prototype.load = function () {
    };
    Page.prototype.render = function () {
    };
    Page.prototype.unload = function () {
    };
    Page.prototype.annotations = function () {
    };
    return Page
  }()
});
// source: src/sdk/module.coffee
require.define('./Users/dtai/work/hanzo/daisho/src/sdk/module', function (module, exports, __dirname, __filename, process) {
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
  }()
});
// source: example/fixtures/user-v1.0.0/main.coffee
require.async('user-v1.0.0/bundle.js', function (module, exports, __dirname, __filename, process) {
  var Module, Page, User, ref, extend = function (child, parent) {
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
  ref = require('./Users/dtai/work/hanzo/daisho/src/sdk'), Page = ref.Page, Module = ref.Module;
  module.exports = User = function (superClass) {
    extend(User, superClass);
    function User() {
      return User.__super__.constructor.apply(this, arguments)
    }
    User.name = 'User';
    User.prototype.routes = {
      '/': Page,
      '/create': Page,
      '/edit': Page
    };
    return User
  }(Module)
})//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVzZXJzL2R0YWkvd29yay9oYW56by9kYWlzaG8vc3JjL3Nkay9pbmRleC5jb2ZmZWUiLCJVc2Vycy9kdGFpL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9zZGsvcGFnZS5jb2ZmZWUiLCJVc2Vycy9kdGFpL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9zZGsvbW9kdWxlLmNvZmZlZSIsIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJQYWdlIiwicmVxdWlyZSIsIk1vZHVsZSIsInByb3RvdHlwZSIsImVsIiwibW9kdWxlMSIsImxvYWQiLCJyZW5kZXIiLCJ1bmxvYWQiLCJhbm5vdGF0aW9ucyIsImpzb24iLCJVc2VyIiwicmVmIiwiZXh0ZW5kIiwiY2hpbGQiLCJwYXJlbnQiLCJrZXkiLCJoYXNQcm9wIiwiY2FsbCIsImN0b3IiLCJjb25zdHJ1Y3RvciIsIl9fc3VwZXJfXyIsInN1cGVyQ2xhc3MiLCJuYW1lIiwicm91dGVzIl0sIm1hcHBpbmdzIjoiOztFQUFBQSxNQUFBLENBQU9DLE9BQVAsR0FBaUI7QUFBQSxJQUNmQyxJQUFBLEVBQU1DLE9BQUEsQ0FBUSw2Q0FBUixDQURTO0FBQUEsSUFFZkMsTUFBQSxFQUFRRCxPQUFBLENBQVEsK0NBQVIsQ0FGTztBQUFBLEc7Ozs7RUNBakIsSUFBSUQsSUFBSixDO0VBRUFGLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQkMsSUFBQSxHQUFRLFlBQVc7QUFBQSxJQUNsQ0EsSUFBQSxDQUFLRyxTQUFMLENBQWVDLEVBQWYsR0FBb0IsSUFBcEIsQ0FEa0M7QUFBQSxJQUdsQ0osSUFBQSxDQUFLRyxTQUFMLENBQWVMLE1BQWYsR0FBd0IsSUFBeEIsQ0FIa0M7QUFBQSxJQUtsQyxTQUFTRSxJQUFULENBQWNJLEVBQWQsRUFBa0JDLE9BQWxCLEVBQTJCO0FBQUEsTUFDekIsS0FBS0QsRUFBTCxHQUFVQSxFQUFWLENBRHlCO0FBQUEsTUFFekIsS0FBS04sTUFBTCxHQUFjTyxPQUZXO0FBQUEsS0FMTztBQUFBLElBVWxDTCxJQUFBLENBQUtHLFNBQUwsQ0FBZUcsSUFBZixHQUFzQixZQUFXO0FBQUEsS0FBakMsQ0FWa0M7QUFBQSxJQVlsQ04sSUFBQSxDQUFLRyxTQUFMLENBQWVJLE1BQWYsR0FBd0IsWUFBVztBQUFBLEtBQW5DLENBWmtDO0FBQUEsSUFjbENQLElBQUEsQ0FBS0csU0FBTCxDQUFlSyxNQUFmLEdBQXdCLFlBQVc7QUFBQSxLQUFuQyxDQWRrQztBQUFBLElBZ0JsQ1IsSUFBQSxDQUFLRyxTQUFMLENBQWVNLFdBQWYsR0FBNkIsWUFBVztBQUFBLEtBQXhDLENBaEJrQztBQUFBLElBa0JsQyxPQUFPVCxJQWxCMkI7QUFBQSxHQUFaLEU7Ozs7RUNGeEIsSUFBSUUsTUFBSixDO0VBRUFKLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQkcsTUFBQSxHQUFVLFlBQVc7QUFBQSxJQUNwQ0EsTUFBQSxDQUFPQyxTQUFQLENBQWlCTyxJQUFqQixHQUF3QixJQUF4QixDQURvQztBQUFBLElBR3BDLFNBQVNSLE1BQVQsR0FBa0I7QUFBQSxLQUhrQjtBQUFBLElBS3BDQSxNQUFBLENBQU9DLFNBQVAsQ0FBaUJHLElBQWpCLEdBQXdCLFlBQVc7QUFBQSxLQUFuQyxDQUxvQztBQUFBLElBT3BDSixNQUFBLENBQU9DLFNBQVAsQ0FBaUJLLE1BQWpCLEdBQTBCLFlBQVc7QUFBQSxLQUFyQyxDQVBvQztBQUFBLElBU3BDLE9BQU9OLE1BVDZCO0FBQUEsR0FBWixFOzs7O0VDRjFCLElBQUFBLE1BQUEsRUFBQUYsSUFBQSxFQUFBVyxJQUFBLEVBQUFDLEdBQUEsRUFBQUMsTUFBQSxhQUFBQyxLQUFBLEVBQUFDLE1BQUE7QUFBQSxlQUFBQyxHQUFBLElBQUFELE1BQUE7QUFBQSxZQUFBRSxPQUFBLENBQUFDLElBQUEsQ0FBQUgsTUFBQSxFQUFBQyxHQUFBO0FBQUEsVUFBQUYsS0FBQSxDQUFBRSxHQUFBLElBQUFELE1BQUEsQ0FBQUMsR0FBQTtBQUFBO0FBQUEsZUFBQUcsSUFBQTtBQUFBLGFBQUFDLFdBQUEsR0FBQU4sS0FBQTtBQUFBO0FBQUEsTUFBQUssSUFBQSxDQUFBaEIsU0FBQSxHQUFBWSxNQUFBLENBQUFaLFNBQUE7QUFBQSxNQUFBVyxLQUFBLENBQUFYLFNBQUEsT0FBQWdCLElBQUE7QUFBQSxNQUFBTCxLQUFBLENBQUFPLFNBQUEsR0FBQU4sTUFBQSxDQUFBWixTQUFBO0FBQUEsYUFBQVcsS0FBQTtBQUFBLE8sMkJBQUEsQztFQUFBRixHQUFBLEdBR0lYLE9BQUEsQ0FBUSx3Q0FBUixDQUhKLEVBQ0VELElBQUEsR0FBQVksR0FBQSxDQUFBWixJQURGLEVBRUVFLE1BQUEsR0FBQVUsR0FBQSxDQUFBVixNQUZGLEM7RUFLQUosTUFBQSxDQUFPQyxPQUFQLEdBQXVCWSxJQUFBLGFBQUFXLFVBQUE7QUFBQSxJLHlCQUFBO0FBQUEsSTs7S0FBQTtBQUFBLElBQ3JCWCxJQUFBLENBQUNZLElBQUQsR0FBTyxNQUFQLENBRHFCO0FBQUEsSSxlQUdyQkMsTSxHQUNFO0FBQUEsV0FBWXhCLElBQVo7QUFBQSxNQUNBLFdBQVlBLElBRFo7QUFBQSxNQUVBLFNBQVlBLElBRlo7QUFBQSxLLENBSm1CO0FBQUEsSSxXQUFBO0FBQUEsSUFBYUUsTUFBYixDIiwic291cmNlUm9vdCI6Ii9leGFtcGxlL2ZpeHR1cmVzL3VzZXItdjEuMC4wIn0=