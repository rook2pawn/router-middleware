const CORS = (req, res, next) => {
  // Always add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-ID");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
  } else {
    next();
  }
};

module.exports = exports = CORS;
