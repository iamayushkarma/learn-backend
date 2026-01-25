const result = (req, res) => {
  const ans = [];
  req.on("data", (chunk) => {
    console.log(chunk);
    ans.push(chunk);
  });
  req.on("end", () => {
    const bufferAns = Buffer.concat(ans).toString();
    const obj = new URLSearchParams(bufferAns);
    const ansObj = Object.fromEntries(obj);
    console.log(ansObj);
    const result = Number(ansObj.a) + Number(ansObj.b);

    res.setHeader("Content-Type", "text/html");
    res.end(
      `<html>
        <head><title>Node</title></head>
        <body>
          <h>Result is ${result}</h>
        </body>
      </html>`,
    );
  });
};
module.exports = result;
