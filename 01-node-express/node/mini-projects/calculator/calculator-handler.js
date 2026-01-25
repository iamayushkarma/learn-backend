const result = require("./result");
const calculatorHandler = (req, res) => {
  res.setHeader("Content-Type", "text/html");
  if (req.url == "/") {
    res.write(
      `<html>
        <head><title>Node</title></head>
        <body>
          <h1>Calculator</h1>
          <a href="/calculate-result">go to calculator</a>
        </body>
      </html>`,
    );
    res.end();
  } else if (req.url == "/calculate-result") {
    res.write(
      `<html>
        <head><title>Node</title></head>
        <body>
          <form action="/result" method="POST">
            <h1>Calculator</h1>
             <input type="number" name="a" />
             <input type="number" name="b" />
            <button type="submit">calculate</button>
          </form>
        </body>
      </html>`,
    );
    res.end();
  } else if (req.url === "/result" && req.method === "POST") {
    return result(req, res);
  } else {
    res.statusCode = 404;
    res.end("<h1>404</h1>");
  }
};
module.exports = calculatorHandler;
