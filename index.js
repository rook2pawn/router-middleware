const App = require("./lib/app");

const Router = ({ bodyParser = true, cors = true } = {}) => {
  return new App({ bodyParser, cors });
};

module.exports = exports = Router;
