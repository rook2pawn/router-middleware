const App = require("./lib/app");
const bodyParser = require("./lib/bodyParser");

function Router() {
  if (!(this instanceof Router)) return new Router();
  this.staticRoutes = {};
  this.regexRoutes = [];

  this.uselist = [];
  this.props = {};
  this.engines = {};
  this.streamengines = {};
  return new App(this);
}

Router.bodyParser = bodyParser;
module.exports = exports = Router;
