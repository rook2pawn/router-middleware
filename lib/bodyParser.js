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
  req.pipe(
    cs(data => {
      req.body = tryParse(data) || qs.parse(data.toString());
      next();
    })
  );
};

module.exports = exports = bodyParser;
