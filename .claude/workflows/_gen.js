// Auto-generated - creates incident-response.md
const fs = require("fs");
const path = require("path");
const target = path.join(__dirname, "incident-response.md");
// Content will be read from stdin
let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => data += chunk);
process.stdin.on("end", () => {
  fs.writeFileSync(target, data, "utf8");
  console.log("Written " + data.length + " chars to " + target);
  fs.unlinkSync(__filename);
});
