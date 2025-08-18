const firewall = (req, res) => {
  if (req.url.slice(0, 4) === "/?/?") {
    console.log("Destroying request with url:", req.url);
    req.destroy();
    return true;
  }
  return false;
};

module.exports = exports = firewall;
