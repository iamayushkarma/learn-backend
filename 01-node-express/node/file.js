const fs = require("fs");

// Write file sync
fs.writeFileSync("./fs-demo.txt", "Initial content\n");

// Write file async
fs.writeFile("./fs-demo.txt", "Async write\n", (err) => {});

// Append file sync
fs.appendFileSync("./fs-demo.txt", `${Date.now()} appended sync\n`);

// Append file async
fs.appendFile("./fs-demo.txt", `${Date.now()} appended async\n`, (err) => {});

// Read file sync
const syncData = fs.readFileSync("./fs-demo.txt", "utf-8");
console.log(syncData);

// Read file async
fs.readFile("./fs-demo.txt", "utf-8", (err, data) => {
  console.log(data);
});

// Check if file exists
if (fs.existsSync("./fs-demo.txt")) {
  console.log("File exists");
}

// Rename file
fs.renameSync("./fs-demo.txt", "./fs-renamed.txt");

// Copy file
fs.copyFileSync("./fs-renamed.txt", "./fs-copy.txt");

// Get file stats
const stats = fs.statSync("./fs-renamed.txt");
console.log(stats.size);

// Delete file
fs.unlinkSync("./fs-copy.txt");

// Create directory
if (!fs.existsSync("./demo-dir")) {
  fs.mkdirSync("./demo-dir");
}

// Read directory
const files = fs.readdirSync("./");
console.log(files);

// Remove directory
fs.rmdirSync("./demo-dir");

// Open and close file
const fd = fs.openSync("./fs-renamed.txt", "r");
fs.closeSync(fd);
