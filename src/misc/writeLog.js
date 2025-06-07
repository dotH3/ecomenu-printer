const fs = require("fs");
const os = require("os");
const path = require("path");

const uploadDir = path.join(os.homedir(), "Desktop", "ecomenu-printer");
const logFile = path.join(uploadDir, "logs.txt");

function writeLog(text) {
  const now = new Date();
  const dateStr = now.toISOString().replace("T", " ").substring(0, 19);
  const logLine = `[${dateStr}] ${text}\n`;
  console.log(logLine.trim());
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  fs.appendFile(logFile, logLine, () => {});
}

module.exports = { writeLog };