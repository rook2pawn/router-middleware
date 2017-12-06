const App = require("./lib/app");
const cs = require("concat-stream");

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

Router.bodyParser = (req, res, next) => {
  req.pipe(
    cs(data => {
      req.body = JSON.parse(data);
      next();
    })
  );
};
module.exports = exports = Router;
