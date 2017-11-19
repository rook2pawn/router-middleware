const App = require('./lib/app');

function Router () {

  if (!(this instanceof Router))
    return new Router;
  this.staticRoutes = {};
  this.regexRoutes = [];

  this.uselist = [];
  this.props = {};
  this.engines = {};
  this.streamengines = {};
  return new App(this);
};

module.exports = exports = Router;
