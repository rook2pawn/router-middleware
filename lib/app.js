const methods = require("methods");
const handler = require("./handler");
const match = require("./match");
const setter = require("./setter");
const statuscodes = require("./statuscodes");
const cs = require("concat-stream");

const App = function () {
  const routes = {};
  const regexRoutes = [];
  const useList = [];
  let fileserver;
  this.props = {};
  this.handleCodes = (code, req, res) => {
    let middleware = this.routes[code]["/"];
    return middleware[0](req, res);
  };

  // this is passed to the http createServer
  this.handler = (req, res) => {
    if (useList.length) {
      if (req._index_use === undefined) req._index_use = 0;
      else req._index_use++;
      if (req._index_use < useList.length) {
        useList[req._index_use](req, res, () => {
          return handler({
            req,
            res,
            routes,
            regexRoutes,
            useList,
            fileserver,
          });
        });
        return;
      }
    }
    return handler({ req, res, routes, regexRoutes, useList, fileserver });
  };

  methods.forEach((method) => {
    routes[method.toUpperCase()] = {};
    this.handler[method] = (path, ...middlewares) => {
      return setter({
        path,
        middlewares,
        routes,
        regexRoutes,
        method,
        fileserver,
      });
    };
  });
  statuscodes.forEach((method) => {
    this.handler[parseInt(method)] = () => {};
  });

  // apply default 404
  // the way this works is that in ln 21, this.handler[code] is set to the setter function which takes a path and function
  this.handler[404]("/", (req, res) => {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });
  this.handler.use = (usefn) => {
    useList.push(usefn);
  };
  this.handler.set = (key, value) => {
    this.props[key] = value;
  };
  this.handler.fileserver = (fs) => {
    fileserver = fs;
  };

  return this.handler;
};

exports = module.exports = App;
