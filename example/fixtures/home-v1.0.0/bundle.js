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
// source: example/fixtures/home-v1.0.0/main.coffee
require.async('home-v1.0.0/bundle.js', function (module, exports, __dirname, __filename, process) {
  var Home, Module, Page, Widgets, ref, extend = function (child, parent) {
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
  Widgets = function (superClass) {
    extend(Widgets, superClass);
    function Widgets() {
      return Widgets.__super__.constructor.apply(this, arguments)
    }
    return Widgets
  }(Page);
  module.exports = Home = function (superClass) {
    extend(Home, superClass);
    function Home() {
      return Home.__super__.constructor.apply(this, arguments)
    }
    Home.name = 'Home';
    Home.prototype.routes = { '/': Widgets };
    return Home
  }(Module)
})//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVzZXJzL2R0YWkvd29yay9oYW56by9kYWlzaG8vc3JjL3Nkay9pbmRleC5jb2ZmZWUiLCJVc2Vycy9kdGFpL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9zZGsvcGFnZS5jb2ZmZWUiLCJVc2Vycy9kdGFpL3dvcmsvaGFuem8vZGFpc2hvL3NyYy9zZGsvbW9kdWxlLmNvZmZlZSIsIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJQYWdlIiwicmVxdWlyZSIsIk1vZHVsZSIsInByb3RvdHlwZSIsImVsIiwibW9kdWxlMSIsImxvYWQiLCJyZW5kZXIiLCJ1bmxvYWQiLCJhbm5vdGF0aW9ucyIsImpzb24iLCJIb21lIiwiV2lkZ2V0cyIsInJlZiIsImV4dGVuZCIsImNoaWxkIiwicGFyZW50Iiwia2V5IiwiaGFzUHJvcCIsImNhbGwiLCJjdG9yIiwiY29uc3RydWN0b3IiLCJfX3N1cGVyX18iLCJzdXBlckNsYXNzIiwibmFtZSIsInJvdXRlcyJdLCJtYXBwaW5ncyI6Ijs7RUFBQUEsTUFBQSxDQUFPQyxPQUFQLEdBQWlCO0FBQUEsSUFDZkMsSUFBQSxFQUFNQyxPQUFBLENBQVEsNkNBQVIsQ0FEUztBQUFBLElBRWZDLE1BQUEsRUFBUUQsT0FBQSxDQUFRLCtDQUFSLENBRk87QUFBQSxHOzs7O0VDQWpCLElBQUlELElBQUosQztFQUVBRixNQUFBLENBQU9DLE9BQVAsR0FBaUJDLElBQUEsR0FBUSxZQUFXO0FBQUEsSUFDbENBLElBQUEsQ0FBS0csU0FBTCxDQUFlQyxFQUFmLEdBQW9CLElBQXBCLENBRGtDO0FBQUEsSUFHbENKLElBQUEsQ0FBS0csU0FBTCxDQUFlTCxNQUFmLEdBQXdCLElBQXhCLENBSGtDO0FBQUEsSUFLbEMsU0FBU0UsSUFBVCxDQUFjSSxFQUFkLEVBQWtCQyxPQUFsQixFQUEyQjtBQUFBLE1BQ3pCLEtBQUtELEVBQUwsR0FBVUEsRUFBVixDQUR5QjtBQUFBLE1BRXpCLEtBQUtOLE1BQUwsR0FBY08sT0FGVztBQUFBLEtBTE87QUFBQSxJQVVsQ0wsSUFBQSxDQUFLRyxTQUFMLENBQWVHLElBQWYsR0FBc0IsWUFBVztBQUFBLEtBQWpDLENBVmtDO0FBQUEsSUFZbENOLElBQUEsQ0FBS0csU0FBTCxDQUFlSSxNQUFmLEdBQXdCLFlBQVc7QUFBQSxLQUFuQyxDQVprQztBQUFBLElBY2xDUCxJQUFBLENBQUtHLFNBQUwsQ0FBZUssTUFBZixHQUF3QixZQUFXO0FBQUEsS0FBbkMsQ0Fka0M7QUFBQSxJQWdCbENSLElBQUEsQ0FBS0csU0FBTCxDQUFlTSxXQUFmLEdBQTZCLFlBQVc7QUFBQSxLQUF4QyxDQWhCa0M7QUFBQSxJQWtCbEMsT0FBT1QsSUFsQjJCO0FBQUEsR0FBWixFOzs7O0VDRnhCLElBQUlFLE1BQUosQztFQUVBSixNQUFBLENBQU9DLE9BQVAsR0FBaUJHLE1BQUEsR0FBVSxZQUFXO0FBQUEsSUFDcENBLE1BQUEsQ0FBT0MsU0FBUCxDQUFpQk8sSUFBakIsR0FBd0IsSUFBeEIsQ0FEb0M7QUFBQSxJQUdwQyxTQUFTUixNQUFULEdBQWtCO0FBQUEsS0FIa0I7QUFBQSxJQUtwQ0EsTUFBQSxDQUFPQyxTQUFQLENBQWlCRyxJQUFqQixHQUF3QixZQUFXO0FBQUEsS0FBbkMsQ0FMb0M7QUFBQSxJQU9wQ0osTUFBQSxDQUFPQyxTQUFQLENBQWlCSyxNQUFqQixHQUEwQixZQUFXO0FBQUEsS0FBckMsQ0FQb0M7QUFBQSxJQVNwQyxPQUFPTixNQVQ2QjtBQUFBLEdBQVosRTs7OztFQ0YxQixJQUFBUyxJQUFBLEVBQUFULE1BQUEsRUFBQUYsSUFBQSxFQUFBWSxPQUFBLEVBQUFDLEdBQUEsRUFBQUMsTUFBQSxhQUFBQyxLQUFBLEVBQUFDLE1BQUE7QUFBQSxlQUFBQyxHQUFBLElBQUFELE1BQUE7QUFBQSxZQUFBRSxPQUFBLENBQUFDLElBQUEsQ0FBQUgsTUFBQSxFQUFBQyxHQUFBO0FBQUEsVUFBQUYsS0FBQSxDQUFBRSxHQUFBLElBQUFELE1BQUEsQ0FBQUMsR0FBQTtBQUFBO0FBQUEsZUFBQUcsSUFBQTtBQUFBLGFBQUFDLFdBQUEsR0FBQU4sS0FBQTtBQUFBO0FBQUEsTUFBQUssSUFBQSxDQUFBakIsU0FBQSxHQUFBYSxNQUFBLENBQUFiLFNBQUE7QUFBQSxNQUFBWSxLQUFBLENBQUFaLFNBQUEsT0FBQWlCLElBQUE7QUFBQSxNQUFBTCxLQUFBLENBQUFPLFNBQUEsR0FBQU4sTUFBQSxDQUFBYixTQUFBO0FBQUEsYUFBQVksS0FBQTtBQUFBLE8sMkJBQUEsQztFQUFBRixHQUFBLEdBR0laLE9BQUEsQ0FBUSx3Q0FBUixDQUhKLEVBQ0VELElBQUEsR0FBQWEsR0FBQSxDQUFBYixJQURGLEVBRUVFLE1BQUEsR0FBQVcsR0FBQSxDQUFBWCxNQUZGLEM7RUFLTVUsT0FBQSxhQUFBVyxVQUFBO0FBQUEsSSw0QkFBQTtBQUFBLEk7O0tBQUE7QUFBQSxJLGNBQUE7QUFBQSxJQUFnQnZCLElBQWhCLEU7RUFFTkYsTUFBQSxDQUFPQyxPQUFQLEdBQXVCWSxJQUFBLGFBQUFZLFVBQUE7QUFBQSxJLHlCQUFBO0FBQUEsSTs7S0FBQTtBQUFBLElBQ3JCWixJQUFBLENBQUNhLElBQUQsR0FBTyxNQUFQLENBRHFCO0FBQUEsSSxlQUdyQkMsTSxHQUNFLE9BQUtiLE9BQUwsRSxDQUptQjtBQUFBLEksV0FBQTtBQUFBLElBQWFWLE1BQWIsQyIsInNvdXJjZVJvb3QiOiIvZXhhbXBsZS9maXh0dXJlcy9ob21lLXYxLjAuMCJ9