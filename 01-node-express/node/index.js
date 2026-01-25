const http = require("http");
const PORT = 5000;
const server = http
  .createServer((req, res) => {
    // console.log(res.url, req.method, req.headers);
    res.setHeader("Content-Type", "text/html");

    if (req.url == "/") {
      res.write(
        `<html>
        <head><title>Node</title></head>
        <body>
          <h1>Home</h1>

          <form action="/message" method="POST">
            <input type="text" name="msg" placeholder="Type something..." />
            <button type="submit">Send</button>
          </form>
        </body>
      </html>`,
      );
    } else if (req.url === "/message" && req.method === "POST") {
      res.setHeader("Location", "/message");
      res.write(
        `<html><head><title>Node</title></head><body><h1>message</h1></body></html>`,
      );
    } else if (req.url == "/about")
      res.write(
        "<html><head><title>Node</title></head><body><h1>about</h1></body></html>",
      );
    else {
      res.write(
        "<html><head><title>Node</title></head><body><h1>404!</h1></body></html>",
      );
    }
    res.end(); // important to write this after sending any res
  })
  .listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}/`);
  });
