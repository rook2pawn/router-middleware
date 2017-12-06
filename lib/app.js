const methods = require("methods");
const handler = require("./handler");
const render = require("./render");
const match = require("./match");
const setter = require("./setter");
const statuscodes = require("./statuscodes");
const cs = require("concat-stream");

const App = function(context) {
  this.context = context;
  this.handleCodes = (code, req, res) => {
    let middleware = this.context.staticRoutes[code]["/"];
    return middleware[0](req, res);
  };

  this.handler = handler.bind({ context: this.context, handleCodes: this.handleCodes }); // (req,res)

  methods.forEach(method => {
    this.handler[method] = setter.bind({ context: this.context, method: method });
  });
  statuscodes.forEach(method => {
    this.handler[parseInt(method)] = setter.bind({ context: this.context, method: method });
  });
  // apply default 404
  this.handler[404]("/", (req, res) => {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });
  this.handler.use = usefn => {
    this.context.uselist.push(usefn);
  };
  this.handler.set = (key, value) => {
    this.context.props[key] = value;
  };
  this.handler.engine = (extension, enginecb) => {
    this.context.engines[extension] = enginecb;
  };
  this.handler.streamengine = (extension, enginecb) => {
    this.context.streamengines[extension] = enginecb;
  };
  this.handler.fileserver = _fileserver => {
    this.context.fileserver = _fileserver;
  };

  return this.handler;
};

exports = module.exports = App;
