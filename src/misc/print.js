const { spawn } = require("child_process");
const path = require("path");

function print_pdf(printerName, pdfPath) {
  const exePath = path.join("./sumatra.exe");
  const args = [
    "-print-to",
    printerName,
    "-silent",
    "-print-settings",
    "shrink",
    pdfPath,
  ];

  spawn(exePath, args, { stdio: "ignore", detached: true }).unref();
}
module.exports = {
  print_pdf,
};
