(function (global) {
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
    module['export'] = Module = function () {
      Module.prototype.json = null;
      function Module(json) {
        this.json = json
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
      User.prototype.routes = {
        '/': null,
        '/create': null,
        '/edit': null
      };
      return User
    }(Module)
  })
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVzZXJzL2R0YWkvd29yay9oYW56by9kYWlzaG8vc3JjL3Nkay9pbmRleC5jb2ZmZWUiLCJVc2Vycy9kdGFpL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9zZGsvcGFnZS5jb2ZmZWUiLCJVc2Vycy9kdGFpL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9zZGsvbW9kdWxlLmNvZmZlZSIsIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJQYWdlIiwicmVxdWlyZSIsIk1vZHVsZSIsInByb3RvdHlwZSIsImVsIiwibW9kdWxlMSIsImxvYWQiLCJ1bmxvYWQiLCJhbm5vdGF0aW9ucyIsImpzb24iLCJVc2VyIiwicmVmIiwiZXh0ZW5kIiwiY2hpbGQiLCJwYXJlbnQiLCJrZXkiLCJoYXNQcm9wIiwiY2FsbCIsImN0b3IiLCJjb25zdHJ1Y3RvciIsIl9fc3VwZXJfXyIsInN1cGVyQ2xhc3MiLCJyb3V0ZXMiXSwibWFwcGluZ3MiOiI7OztJQUFBQSxNQUFBLENBQU9DLE9BQVAsR0FBaUI7QUFBQSxNQUNmQyxJQUFBLEVBQU1DLE9BQUEsQ0FBUSw2Q0FBUixDQURTO0FBQUEsTUFFZkMsTUFBQSxFQUFRRCxPQUFBLENBQVEsK0NBQVIsQ0FGTztBQUFBLEs7Ozs7SUNBakIsSUFBSUQsSUFBSixDO0lBRUFGLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQkMsSUFBQSxHQUFRLFlBQVc7QUFBQSxNQUNsQ0EsSUFBQSxDQUFLRyxTQUFMLENBQWVDLEVBQWYsR0FBb0IsSUFBcEIsQ0FEa0M7QUFBQSxNQUdsQ0osSUFBQSxDQUFLRyxTQUFMLENBQWVMLE1BQWYsR0FBd0IsSUFBeEIsQ0FIa0M7QUFBQSxNQUtsQyxTQUFTRSxJQUFULENBQWNJLEVBQWQsRUFBa0JDLE9BQWxCLEVBQTJCO0FBQUEsUUFDekIsS0FBS0QsRUFBTCxHQUFVQSxFQUFWLENBRHlCO0FBQUEsUUFFekIsS0FBS04sTUFBTCxHQUFjTyxPQUZXO0FBQUEsT0FMTztBQUFBLE1BVWxDTCxJQUFBLENBQUtHLFNBQUwsQ0FBZUcsSUFBZixHQUFzQixZQUFXO0FBQUEsT0FBakMsQ0FWa0M7QUFBQSxNQVlsQ04sSUFBQSxDQUFLRyxTQUFMLENBQWVJLE1BQWYsR0FBd0IsWUFBVztBQUFBLE9BQW5DLENBWmtDO0FBQUEsTUFjbENQLElBQUEsQ0FBS0csU0FBTCxDQUFlSyxXQUFmLEdBQTZCLFlBQVc7QUFBQSxPQUF4QyxDQWRrQztBQUFBLE1BZ0JsQyxPQUFPUixJQWhCMkI7QUFBQSxLQUFaLEU7Ozs7SUNGeEIsSUFBSUUsTUFBSixDO0lBRUFKLE1BQUEsQ0FBTyxRQUFQLElBQW1CSSxNQUFBLEdBQVUsWUFBVztBQUFBLE1BQ3RDQSxNQUFBLENBQU9DLFNBQVAsQ0FBaUJNLElBQWpCLEdBQXdCLElBQXhCLENBRHNDO0FBQUEsTUFHdEMsU0FBU1AsTUFBVCxDQUFnQk8sSUFBaEIsRUFBc0I7QUFBQSxRQUNwQixLQUFLQSxJQUFMLEdBQVlBLElBRFE7QUFBQSxPQUhnQjtBQUFBLE1BT3RDUCxNQUFBLENBQU9DLFNBQVAsQ0FBaUJHLElBQWpCLEdBQXdCLFlBQVc7QUFBQSxPQUFuQyxDQVBzQztBQUFBLE1BU3RDSixNQUFBLENBQU9DLFNBQVAsQ0FBaUJJLE1BQWpCLEdBQTBCLFlBQVc7QUFBQSxPQUFyQyxDQVRzQztBQUFBLE1BV3RDLE9BQU9MLE1BWCtCO0FBQUEsS0FBWixFOzs7O0lDRjVCLElBQUFBLE1BQUEsRUFBQUYsSUFBQSxFQUFBVSxJQUFBLEVBQUFDLEdBQUEsRUFBQUMsTUFBQSxhQUFBQyxLQUFBLEVBQUFDLE1BQUE7QUFBQSxpQkFBQUMsR0FBQSxJQUFBRCxNQUFBO0FBQUEsY0FBQUUsT0FBQSxDQUFBQyxJQUFBLENBQUFILE1BQUEsRUFBQUMsR0FBQTtBQUFBLFlBQUFGLEtBQUEsQ0FBQUUsR0FBQSxJQUFBRCxNQUFBLENBQUFDLEdBQUE7QUFBQTtBQUFBLGlCQUFBRyxJQUFBO0FBQUEsZUFBQUMsV0FBQSxHQUFBTixLQUFBO0FBQUE7QUFBQSxRQUFBSyxJQUFBLENBQUFmLFNBQUEsR0FBQVcsTUFBQSxDQUFBWCxTQUFBO0FBQUEsUUFBQVUsS0FBQSxDQUFBVixTQUFBLE9BQUFlLElBQUE7QUFBQSxRQUFBTCxLQUFBLENBQUFPLFNBQUEsR0FBQU4sTUFBQSxDQUFBWCxTQUFBO0FBQUEsZUFBQVUsS0FBQTtBQUFBLFMsMkJBQUEsQztJQUFBRixHQUFBLEdBR0lWLE9BQUEsQ0FBUSx3Q0FBUixDQUhKLEVBQ0VELElBQUEsR0FBQVcsR0FBQSxDQUFBWCxJQURGLEVBRUVFLE1BQUEsR0FBQVMsR0FBQSxDQUFBVCxNQUZGLEM7SUFLQUosTUFBQSxDQUFPQyxPQUFQLEdBQXVCVyxJQUFBLGFBQUFXLFVBQUE7QUFBQSxNLHlCQUFBO0FBQUEsTTs7T0FBQTtBQUFBLE0sZUFDckJDLE0sR0FDRTtBQUFBLGFBQVksSUFBWjtBQUFBLFFBQ0EsV0FBWSxJQURaO0FBQUEsUUFFQSxTQUFZLElBRlo7QUFBQSxPLENBRm1CO0FBQUEsTSxXQUFBO0FBQUEsTUFBYXBCLE1BQWIsQyIsInNvdXJjZVJvb3QiOiIvZXhhbXBsZS9maXh0dXJlcy91c2VyLXYxLjAuMCJ9