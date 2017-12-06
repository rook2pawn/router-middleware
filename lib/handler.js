const match = require("./match");
const render = require("./render");
const streamrender = require("./streamrender");

const handler = function(req, res) {
  let context = this.context;
  let that = this;
  if (context.uselist.length > 0) {
    if (req._index_use === undefined) req._index_use = 0;
    else req._index_use++;
    if (req._index_use < context.uselist.length) {
      context.uselist[req._index_use](req, res, function() {
        return handler.apply(that, [req, res]);
      });
      return;
    }
  }
  if (res.render === undefined) {
    res.render = render.bind({ res: res, engines: context.engines, props: context.props });
  }
  if (res.streamrender === undefined) {
    res.streamrender = streamrender.bind({
      res: res,
      streamengines: context.streamengines,
      props: context.props
    });
  }
  if (req._index === undefined) req._index = 0;
  else req._index++;
  const middleware = match(req, context.staticRoutes, context.regexRoutes, context.constants);

  if (middleware) {
    if (middleware[req._index] !== undefined) {
      middleware[req._index](req, res, function() {
        handler.apply(that, [req, res]);
      });
    } else if (req.method == "GET" && context.fileserver !== undefined) {
      context.fileserver(req, res); // this is for when we want to next() to our fileserver
    }
  } else if (req.method == "GET" && context.fileserver !== undefined) {
    context.fileserver(req, res); // this is for when we want all fallthrough to fileserver
  } else {
    this.handleCodes(404, req, res);
  }
};

module.exports = exports = handler;
