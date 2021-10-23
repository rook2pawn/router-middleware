const App = require("./lib/app");
const bodyParser = require("./lib/bodyParser");
const firewall = require("./lib/firewall");

const Router = () => {
  return new App();
};

Router.bodyParser = bodyParser;
module.exports = exports = Router;
