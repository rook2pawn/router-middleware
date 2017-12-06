var path = require("path");
var fs = require("fs");

var streamrender = function(basename, obj) {
  var res = this.res;
  var viewEngine = this.props["view engine"];
  var filePath = path
    .join(process.cwd(), this.props["views"], basename)
    .concat(".")
    .concat(viewEngine);
  if (fs.existsSync(filePath)) {
    this.streamengines[viewEngine](filePath, obj, res);
  } else {
    //throw new Error("res.render filepath:", filePath)
  }
};
exports = module.exports = streamrender;
