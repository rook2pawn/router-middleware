const match = require("./match");
const url = require("url");
const qs = require("querystring");

const handler = function ({
  req,
  res,
  useList,
  routes,
  regexRoutes,
  fileserver,
  handleCodes,
}) {
  if (useList.length > 0) {
    if (req._index_use === undefined) req._index_use = 0;
    else req._index_use++;
    if (req._index_use < useList.length) {
      useList[req._index_use](req, res, () => {
        return handler({ req, res, useList, routes, regexRoutes, fileserver });
      });
      return;
    }
  }

  let path = req.url;
  if (path.length > 1 && path.slice(-1) === "/") {
    path = path.slice(0, -1);
  }
  if (path.indexOf("?") !== -1) {
    var parsed = url.parse(req.url);
    req.query = qs.parse(parsed.query);
    path = parsed.pathname;
  } else {
    req.query = {};
  }
  req.url = path;

  const middlewares = match({ req, routes, regexRoutes });
  if (middlewares) {
    if (req._index === undefined) {
      req._index = 0;
    }
    if (middlewares[req._index] !== undefined) {
      return middlewares[req._index](req, res, () => {
        req._index++;
        return handler({ req, res, useList, routes, regexRoutes, fileserver });
      });
    } else if (req.method == "GET" && fileserver !== undefined) {
      return fileserver(req, res); // this is for when we want to next() to our fileserver
    }
  } else if (req.method == "GET" && fileserver !== undefined) {
    return fileserver(req, res); // this is for when we want all fallthrough to fileserver
  } else {
    return handleCodes(404, req, res);
  }
};

module.exports = exports = handler;
