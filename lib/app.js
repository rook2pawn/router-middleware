const methods = require("methods");
const handler = require("./handler");
const match = require("./match");
const setter = require("./setter");
const statuscodes = require("./statuscodes");
const cs = require("concat-stream");
const firewall = require("./firewall");
const CORS = require("./cors");
const BODYPARSER = require("./bodyParser");

const App = function ({ cors, bodyParser }) {
  const routes = {};
  const regexRoutes = [];
  const useList = [];
  if (cors) {
    useList.push(CORS);
  }
  if (bodyParser) {
    useList.push(BODYPARSER);
  }
  let fileserver;
  this.props = {};
  const handleCodes = (code, req, res) => {
    let middleware = routes[code];
    if (!middleware) {
      return res.end(`No middleware defined on ${code}`);
    }
    return middleware(req, res);
  };

  // this is passed to the http createServer
  this.handler = (req, res) => {
    if (firewall(req) === true) {
      return;
    }
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
            handleCodes,
          });
        });
        return;
      }
    }
    return handler({
      req,
      res,
      routes,
      regexRoutes,
      useList,
      fileserver,
      handleCodes,
    });
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
  statuscodes.forEach((code) => {
    routes[parseInt(code)] = {};
  });

  // apply default 404
  routes[404] = (req, res) => {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  };
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
