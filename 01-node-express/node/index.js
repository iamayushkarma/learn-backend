const http = require("http");
const PORT = 5000;
const server = http
  .createServer((req, res) => console.log(res))
  .listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}/`);
  });
