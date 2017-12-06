var path = require("path");
var fs = require("fs");
var render = function(basename, obj) {
  var res = this.res;
  var viewEngine = this.props["view engine"];
  var filePath = path
    .join(process.cwd(), this.props["views"], basename)
    .concat(".")
    .concat(viewEngine);
  if (fs.existsSync(filePath)) {
    this.engines[viewEngine](filePath, obj, function(err, rendered) {
      res.setHeader("Content-Type", "text/html");
      res.write(rendered);
      res.end();
    });
  } else {
    //throw new Error("res.render filepath:", filePath)
  }
};
exports = module.exports = render;
