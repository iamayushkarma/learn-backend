const reqHandler = require("./index.js");
const http = require("http");
const PORT = 5000;

const server = http.createServer(reqHandler).listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}/`);
});
