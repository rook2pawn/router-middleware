var Handle = require('./lib/handle');
function Router() {
  if (!(this instanceof Router)) return new Router
  this.routes = {};
  this.regexroutes = [];

  this.uselist = [];
  this.fileserver = undefined;
  this.props = {};
  this.engines = {};
  this.streamengines = {};
  return new Handle(this);
}
module.exports = exports = Router;