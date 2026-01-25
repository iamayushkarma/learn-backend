const calculatorHandler = require("./calculator-handler");
const http = require("http");
const PORT = 3001;

const server = http
  .createServer(calculatorHandler)
  .listen(PORT, () =>
    console.log(`Calculator app listening on http://localhost:${PORT}`),
  );
