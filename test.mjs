// test.mjs
import http from "node:http";
import createApp from "./dist/index.js";

const app = createApp();
const server = http.createServer(app);

app.get("/user/:id", (req, res) => {
  res.json({ id: req.params.id });
});

app.get("/health", (_req, res) => {
  res.send("ok");
});

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
