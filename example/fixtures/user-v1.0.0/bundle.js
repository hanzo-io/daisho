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
      User.name = 'User';
      User.prototype.routes = {
        '/': null,
        '/create': null,
        '/edit': null
      };
      return User
    }(Module)
  })
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVzZXJzL2R0YWkvd29yay9oYW56by9kYWlzaG8vc3JjL3Nkay9pbmRleC5jb2ZmZWUiLCJVc2Vycy9kdGFpL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9zZGsvcGFnZS5jb2ZmZWUiLCJVc2Vycy9kdGFpL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9zZGsvbW9kdWxlLmNvZmZlZSIsIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJQYWdlIiwicmVxdWlyZSIsIk1vZHVsZSIsInByb3RvdHlwZSIsImVsIiwibW9kdWxlMSIsImxvYWQiLCJ1bmxvYWQiLCJhbm5vdGF0aW9ucyIsImpzb24iLCJVc2VyIiwicmVmIiwiZXh0ZW5kIiwiY2hpbGQiLCJwYXJlbnQiLCJrZXkiLCJoYXNQcm9wIiwiY2FsbCIsImN0b3IiLCJjb25zdHJ1Y3RvciIsIl9fc3VwZXJfXyIsInN1cGVyQ2xhc3MiLCJuYW1lIiwicm91dGVzIl0sIm1hcHBpbmdzIjoiOzs7SUFBQUEsTUFBQSxDQUFPQyxPQUFQLEdBQWlCO0FBQUEsTUFDZkMsSUFBQSxFQUFNQyxPQUFBLENBQVEsNkNBQVIsQ0FEUztBQUFBLE1BRWZDLE1BQUEsRUFBUUQsT0FBQSxDQUFRLCtDQUFSLENBRk87QUFBQSxLOzs7O0lDQWpCLElBQUlELElBQUosQztJQUVBRixNQUFBLENBQU9DLE9BQVAsR0FBaUJDLElBQUEsR0FBUSxZQUFXO0FBQUEsTUFDbENBLElBQUEsQ0FBS0csU0FBTCxDQUFlQyxFQUFmLEdBQW9CLElBQXBCLENBRGtDO0FBQUEsTUFHbENKLElBQUEsQ0FBS0csU0FBTCxDQUFlTCxNQUFmLEdBQXdCLElBQXhCLENBSGtDO0FBQUEsTUFLbEMsU0FBU0UsSUFBVCxDQUFjSSxFQUFkLEVBQWtCQyxPQUFsQixFQUEyQjtBQUFBLFFBQ3pCLEtBQUtELEVBQUwsR0FBVUEsRUFBVixDQUR5QjtBQUFBLFFBRXpCLEtBQUtOLE1BQUwsR0FBY08sT0FGVztBQUFBLE9BTE87QUFBQSxNQVVsQ0wsSUFBQSxDQUFLRyxTQUFMLENBQWVHLElBQWYsR0FBc0IsWUFBVztBQUFBLE9BQWpDLENBVmtDO0FBQUEsTUFZbENOLElBQUEsQ0FBS0csU0FBTCxDQUFlSSxNQUFmLEdBQXdCLFlBQVc7QUFBQSxPQUFuQyxDQVprQztBQUFBLE1BY2xDUCxJQUFBLENBQUtHLFNBQUwsQ0FBZUssV0FBZixHQUE2QixZQUFXO0FBQUEsT0FBeEMsQ0Fka0M7QUFBQSxNQWdCbEMsT0FBT1IsSUFoQjJCO0FBQUEsS0FBWixFOzs7O0lDRnhCLElBQUlFLE1BQUosQztJQUVBSixNQUFBLENBQU8sUUFBUCxJQUFtQkksTUFBQSxHQUFVLFlBQVc7QUFBQSxNQUN0Q0EsTUFBQSxDQUFPQyxTQUFQLENBQWlCTSxJQUFqQixHQUF3QixJQUF4QixDQURzQztBQUFBLE1BR3RDLFNBQVNQLE1BQVQsQ0FBZ0JPLElBQWhCLEVBQXNCO0FBQUEsUUFDcEIsS0FBS0EsSUFBTCxHQUFZQSxJQURRO0FBQUEsT0FIZ0I7QUFBQSxNQU90Q1AsTUFBQSxDQUFPQyxTQUFQLENBQWlCRyxJQUFqQixHQUF3QixZQUFXO0FBQUEsT0FBbkMsQ0FQc0M7QUFBQSxNQVN0Q0osTUFBQSxDQUFPQyxTQUFQLENBQWlCSSxNQUFqQixHQUEwQixZQUFXO0FBQUEsT0FBckMsQ0FUc0M7QUFBQSxNQVd0QyxPQUFPTCxNQVgrQjtBQUFBLEtBQVosRTs7OztJQ0Y1QixJQUFBQSxNQUFBLEVBQUFGLElBQUEsRUFBQVUsSUFBQSxFQUFBQyxHQUFBLEVBQUFDLE1BQUEsYUFBQUMsS0FBQSxFQUFBQyxNQUFBO0FBQUEsaUJBQUFDLEdBQUEsSUFBQUQsTUFBQTtBQUFBLGNBQUFFLE9BQUEsQ0FBQUMsSUFBQSxDQUFBSCxNQUFBLEVBQUFDLEdBQUE7QUFBQSxZQUFBRixLQUFBLENBQUFFLEdBQUEsSUFBQUQsTUFBQSxDQUFBQyxHQUFBO0FBQUE7QUFBQSxpQkFBQUcsSUFBQTtBQUFBLGVBQUFDLFdBQUEsR0FBQU4sS0FBQTtBQUFBO0FBQUEsUUFBQUssSUFBQSxDQUFBZixTQUFBLEdBQUFXLE1BQUEsQ0FBQVgsU0FBQTtBQUFBLFFBQUFVLEtBQUEsQ0FBQVYsU0FBQSxPQUFBZSxJQUFBO0FBQUEsUUFBQUwsS0FBQSxDQUFBTyxTQUFBLEdBQUFOLE1BQUEsQ0FBQVgsU0FBQTtBQUFBLGVBQUFVLEtBQUE7QUFBQSxTLDJCQUFBLEM7SUFBQUYsR0FBQSxHQUdJVixPQUFBLENBQVEsd0NBQVIsQ0FISixFQUNFRCxJQUFBLEdBQUFXLEdBQUEsQ0FBQVgsSUFERixFQUVFRSxNQUFBLEdBQUFTLEdBQUEsQ0FBQVQsTUFGRixDO0lBS0FKLE1BQUEsQ0FBT0MsT0FBUCxHQUF1QlcsSUFBQSxhQUFBVyxVQUFBO0FBQUEsTSx5QkFBQTtBQUFBLE07O09BQUE7QUFBQSxNQUNyQlgsSUFBQSxDQUFDWSxJQUFELEdBQU8sTUFBUCxDQURxQjtBQUFBLE0sZUFHckJDLE0sR0FDRTtBQUFBLGFBQVksSUFBWjtBQUFBLFFBQ0EsV0FBWSxJQURaO0FBQUEsUUFFQSxTQUFZLElBRlo7QUFBQSxPLENBSm1CO0FBQUEsTSxXQUFBO0FBQUEsTUFBYXJCLE1BQWIsQyIsInNvdXJjZVJvb3QiOiIvZXhhbXBsZS9maXh0dXJlcy91c2VyLXYxLjAuMCJ9