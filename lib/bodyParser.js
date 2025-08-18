const qs = require("querystring");
const cs = require("concat-stream");

const tryParse = function (jsonString) {
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === 'object')
      return o;
  } catch (e) {
  }
  return false
}

const bodyParser = (req, res, next) => {
  const isBinary =
  req.headers["content-type"] &&
  req.headers["content-type"].startsWith("audio/");


  req.pipe(
    cs(data => {
      req.body = isBinary ? data : tryParse(data) || qs.parse(data.toString());
      next();
    })
  );
};

module.exports = exports = bodyParser;
