const reqHandler = (req, res) => {
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
    const body = [];
    req.on("data", (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });
    req.on("end", () => {
      const data = Buffer.concat(body).toString();
      const objData = new URLSearchParams(data);
      const bodyObj = Object.fromEntries(objData);

      // for (const [key, value] of objData.entries()) {
      //   bodyObj[key] = value;
      // }

      console.log(bodyObj);
    });
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
};
module.exports = reqHandler;
